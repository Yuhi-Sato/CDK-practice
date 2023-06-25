# 実践！AWS CDK #1 導入

参考URL:https://dev.classmethod.jp/articles/cdk-practice-1-introduction/

### 学び

- CDK 上でプログラミング言語(今回は TypeScript)で CloudFormation のスタックを作成し、デプロイが可能
- CDK 上では Construct 単位でコンポーネントを管理している
- Construct には L1, L2, L3 の 3 つのレイヤーがある

### 手順

CDK をインストール  
`npm install -g aws-cdk`

ディレクトリを作成し、移動  
`mkdir devio && cd devio`

CDK をインストール  
`npx aws-cdk init app --language typescrip`

CDKのバージョンを確認する  
`cdk --version`

バージョンがv2の場合、モジュールのインポート方法が異なるため注意(参考URLはv1)　　

`~/devio/lib/devio-stack.ts`
```tsx
import { Stack, StackProps} from 'aws-cdk-lib'; // 変更
import { Construct } from 'constructs'; // 変更
import { Vpc } from 'aws-cdk-lib/aws-ec2'; // 変更

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Vpc(this, 'Vpc'); // リソース
  }
}

```

CFn のテンプレートを作成  
`cdk synth`

CFn で定義したリソースをデプロイ  
`cdk deploy`

CFn で作成したリソースを削除  
`cdk destroy`

# 実践！AWS CDK #2 VPC

参考 URL:
https://dev.classmethod.jp/articles/cdk-practice-2-vpc/  
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.CfnVPC.html

### 学び

- L1 は L2 よりもカスタマイズ性が高い
- VPC リソースに対応する L1Construct は CfnVPC

### 手順


`~/devio/lib/devio-stack.ts`
```tsx
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2'; // 変更

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CfnVPC(this, "Vpc", { // L1でCFnを作成
      cidrBlock: "10.0.0.0/19",
      tags: [{ key: "Name", value: "devio-stg-vpc" }],
    });
  }
}

```

cidrBlock は「10.0.0.0/16」だと大きすぎる気がするので「10.0.0.0/19」に変更しました。

CFn のテンプレートを作成  
`cdk synth`

CFn で定義したリソースをデプロイ  
`cdk deploy`

CFn で作成したリソースを削除  
`cdk destroy`

# 実践！AWS CDK #3 テスト

参考 URL:  
https://dev.classmethod.jp/articles/cdk-practice-3-test/  
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.assertions-readme.html

### 学び
Fine-grained assertions  
作成されるCFnのリソースについて以下をテストできる
* リソースの存在→hasResource
* リソースの数→resourceCountIs
* リソースのプロパティ→hasResourceProperties
* 出力の内容→hasOutput

### 手順
以下のように~/devio/test/devio.test.tsのコメントアウトを外す

`~/devio/test/devio.test.ts`
```tsx
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../lib/devio-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/devio-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new Devio.DevioStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
  });
});
```

テストを実行  
`npm run build && npm test`  

以下のようにfailedと出力される
```
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        4.809 s, estimated 5 
```

\~/devio/test/devio.test.tsの以下の部分でAWS::SQS::Queueのリソースが存在するかをテストしているが、このリソースを\~/devio/lib/devio-stack.tsで定義していないため、テストが失敗している
```tsx
template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
});
```
~/devio/test/devio.test.tsを以下のように書き換える

`~/devio/test/devio.test.ts`
```tsx
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../lib/devio-stack';

test('Vpc', () => {
    const app = new cdk.App();
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/19',
      Tags: [{ 'Key': 'Name', 'Value': 'devio-stg-vpc' }],
    });
});

```

以下の部分ではAWS::EC2::VPCのリソース数が1個であるかテストしてる

```tsx
template.resourceCountIs('AWS::EC2::VPC', 1);
```

以下の部分では、リソースのプロパティについてテストしている
```tsx
template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/19',
      Tags: [{ 'Key': 'Name', 'Value': 'devio-stg-vpc' }],
});
```

もう一度テストを実行

`npm run build && npm test`

テストがpassする

```
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        5.421 s
```

# 実践！AWS CDK #5 サブネット
参考URL:
https://dev.classmethod.jp/articles/cdk-practice-5-subnet/

### 学び
* CDKのL1でサブネットのリソースを簡単に作成できる

### 手順
今回は以下の構成図を作っていきます
![Untitled Diagram (1)](https://github.com/Yuhi-Sato/CDK-practice/assets/91863685/556e613d-5038-4900-95dd-5ef420f856fd)

`cdk.json`に以下を追記する
```json
"systemName": "devio",
"envType": "stg"
```

`~/devio/test/devio.test.ts`
```tsx
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC,CfnSubnet } from 'aws-cdk-lib/aws-ec2';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const systemName = this.node.tryGetContext('systemName');
    const envType = this.node.tryGetContext('envType');

    // VPCを定義
    const vpc = new CfnVPC(this, "Vpc", { 
      cidrBlock: "10.0.0.0/19",
      tags: [{ key: "Name", value: `${systemName}-${envType}-vpc` }],
    });

    // サブネットのCIDRブロックを定義
    const CIDR = ['10.0.0.0/24', '10.0.1.0/24','10.0.2.0/24','10.0.3.0/24',
    '10.0.4.0/24','10.0.5.0/24','10.0.6.0/24','10.0.7.0/24',
    '10.0.8.0/24','10.0.9.0/24','10.0.10.0/24','10.0.11.0/24'];

    // サブネットのAZを定義
    const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];

    const PublicSubnetA = new CfnSubnet(this,'PublicSubnetA',{
      cidrBlock: CIDR[0],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1a`}]
    });
    const PublicSubnetC = new CfnSubnet(this,'PublicSubnetC',{
      cidrBlock: CIDR[1],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1c`}]
    });
    const PublicSubnetD = new CfnSubnet(this,'PublicSubnetD',{
      cidrBlock: CIDR[2],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1d`}]
    });
    const ProtectedSubnetA = new CfnSubnet(this,'ProtectedSubnetA',{
      cidrBlock: CIDR[4],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1a`}]
    });
    const ProtectedSubnetC = new CfnSubnet(this,'ProtectedSubnetC',{
      cidrBlock: CIDR[5],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1c`}]
    });
    const ProtectedSubnetD = new CfnSubnet(this,'ProtectedSubnetD',{
      cidrBlock: CIDR[6],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1d`}]
    });
    const PrivateSubnetA = new CfnSubnet(this,'PrivateSubnetA',{
      cidrBlock: CIDR[8],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1a`}]
    });
    const PrivateSubnetC = new CfnSubnet(this,'PrivateSubnetC',{
      cidrBlock: CIDR[9],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1c`}]
    });
    const PrivateSubnetD = new CfnSubnet(this,'PrivateSubnetD',{
      cidrBlock: CIDR[10],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1d`}]
    });

  }
}

```

テスト用に環境変数を定義するモジュールを作成  
`~/devio/test/env.ts`
```tsx
export const systemName = "devio";
export const envType = "stg";
```

テストコード
```tsx
import * as cdk from 'aws-cdk-lib';
import { Match,Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../lib/devio-stack';
import {systemName,envType} from './env';

test('Vpc', () => {
    const app = new cdk.App({
      context: {
          'systemName': 'devio',
          'envType': 'stg'
      }
  });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 9);

    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.1.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.2.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.4.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.5.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.6.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.8.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.9.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.10.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1d` }]
    });
});
```

# 実践！AWS CDK #7 ファイル分割
参考URL:https://dev.classmethod.jp/articles/cdk-practice-7-split-file/

### 学び
* リソースを定義するクラスを作り、スタック作成用のファイルをスッキリさせる
* リソースごとにクラス定義ファイルを分割する
* リソースごとにテストファイルを分割する

### 手順
リソースのクラス作成用のファイルを作成  
`mkdir lib/resource` 
`cd lib/resource`  
`touch vpc.ts subnet.ts`  


VPCのクラスを定義する  
`~/devio/lib/resource/vpc.ts`  
```tsx
import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

export class Vpc {
    public vpc: CfnVPC;

    constructor() { };

    public createResources(scope: Construct) {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');

        this.vpc = new CfnVPC(scope, 'Vpc', {
            cidrBlock: '10.0.0.0/19',
            tags: [{ key: 'Name', value: `${systemName}-${envType}-vpc` }]
        });
    }
}
```

Subnetのクラスを定義する  
`~/lib/resource/subnet.ts`  
```tsx
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC,CfnSubnet } from 'aws-cdk-lib/aws-ec2';

export class Subnet {
    public PublicSubnetA: CfnSubnet;
    public PublicSubnetC: CfnSubnet;
    public PublicSubnetD: CfnSubnet;
    public ProtectedSubnetA: CfnSubnet;
    public ProtectedSubnetC: CfnSubnet;
    public ProtectedSubnetD: CfnSubnet;
    public PrivateSubnetA: CfnSubnet;
    public PrivateSubnetC: CfnSubnet;
    public PrivateSubnetD: CfnSubnet;

    private readonly vpc: CfnVPC;

    constructor(vpc: CfnVPC) {
        this.vpc = vpc;
    };

    public createResources(scope: Construct) {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');

        // サブネットのCIDRブロックを定義
        const CIDR = ['10.0.0.0/24', '10.0.1.0/24','10.0.2.0/24','10.0.3.0/24',
        '10.0.4.0/24','10.0.5.0/24','10.0.6.0/24','10.0.7.0/24',
        '10.0.8.0/24','10.0.9.0/24','10.0.10.0/24','10.0.11.0/24'];

        // サブネットのAZを定義
        const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];

        this.PublicSubnetA = new CfnSubnet(scope,'PublicSubnetA',{
        cidrBlock: CIDR[0],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1a`}]
        })
        this.PublicSubnetC = new CfnSubnet(scope,'PublicSubnetC',{
        cidrBlock: CIDR[1],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1c`}]
        })
        this.PublicSubnetD = new CfnSubnet(scope,'PublicSubnetD',{
        cidrBlock: CIDR[2],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1d`}]
        })
        this.ProtectedSubnetA = new CfnSubnet(scope,'ProtectedSubnetA',{
        cidrBlock: CIDR[4],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1a`}]
        })
        this.ProtectedSubnetC = new CfnSubnet(scope,'ProtectedSubnetC',{
        cidrBlock: CIDR[5],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1c`}]
        })
        this.ProtectedSubnetD = new CfnSubnet(scope,'ProtectedSubnetD',{
        cidrBlock: CIDR[6],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1d`}]
        })
        this.PrivateSubnetA = new CfnSubnet(scope,'PrivateSubnetA',{
        cidrBlock: CIDR[8],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1a`}]
        })
        this.PrivateSubnetC = new CfnSubnet(scope,'PrivateSubnetC',{
        cidrBlock: CIDR[9],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1c`}]
        })
        this.PrivateSubnetD = new CfnSubnet(scope,'PrivateSubnetD',{
        cidrBlock: CIDR[10],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1d`}]
        })
    }
}
```

スタックを作成  
`~/devio/lib/devio-stack.ts`  
```tsx
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './resource/vpc';
import { Subnet } from './resource/subnet';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc();
    vpc.createResources(this);

    const subnet = new Subnet(vpc.vpc);
    subnet.createResources(this);
  }
}
```

テスト用のファイルを作成  

`mkdir test/resources`  
`cd test/resource`   
`touch vpc.test.ts subnet.test.ts`  

以下がテストファイルになります

`~/devio/test/resources/vpc.test.ts`  
```tsx
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('Vpc', () => {
    const app = new cdk.App({
      context: {
          'systemName': 'devio',
          'envType': 'stg'
      }
  });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResourceProperties('AWS::EC2::VPC',{
        "CidrBlock": "10.0.0.0/19",
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-vpc`}]
    });
});
```

`~/devio/test/resources/subnet.test.ts`  
```tsx
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('Subnet', () => {
    const app = new cdk.App({
      context: {
          'systemName': 'devio',
          'envType': 'stg'
      }
  });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::EC2::Subnet', 9);

    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.1.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.2.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.4.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.5.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.6.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.8.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.9.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.10.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1d` }]
    });
});
```

テストを実行  

`npm run build && npm test`
```
 PASS  test/devio.test.ts (6.744 s)
 PASS  test/resources/vpc.test.ts (6.738 s)
 PASS  test/resources/subnet.test.ts (6.745 s)

Test Suites: 3 passed, 3 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        7.179 s
```

# 実践！AWS CDK #8 抽象化
参考URL:
https://dev.classmethod.jp/articles/cdk-practice-8-abstraction/  
https://www.udemy.com/share/103eLk3@WGNxUIYac5fZVlBol7xVVvqzzOOPGUVy-4JlnLijVdzJcjJURtFrdV1vWi7X2lbelw==/  

### 学び
* 抽象クラス、抽象メソッドを定義すると子クラスは抽象メソッドのオーバーライドを強制される
* 抽象クラスを利用して、リソースのクラスの共通部分を作成する

### 抽象クラスとは

抽象クラスとはクラス継承を前提としたクラスであり、インスタンス化することができません。

抽象クラス内で抽象メソッドを定義することで、継承先のクラスでオーバーライドを強要することができます。

以下は抽象クラスUniversityを継承する様子です。

```tsx
// 抽象クラス
abstract class University {
    constructor(public id: string, public studentname: string){}
    // 抽象メソッドを定義
    // ここではメソッドの実装はできず、代わりに返り値の型を示す
    abstract describe(this: University): void
}

// Universityクラスを継承
class EngineeringFaculty extends University{
    // 抽象メソッドを実装
    describe(this: University){
        console.log(`University　Engineering　Faculty ${this.id}: ${this.studentname})`)
    }
}
```

### 手順
~/devio/lib/resource/abstractディレクトリを作成し、この中にresource.tsを作成します

resource.ts内で抽象クラスを定義します

継承先のリソースクラスでcreateResourcesのオーバーライドを強要しています

`~/devio/lib/resource/abstract/resource.ts`
```tsx
import { Construct } from 'constructs';

export abstract class Resource{
    constructor(){}

    abstract createResources(scope: Construct): void;

    protected createResourceName(scope: Construct, originalName: string): string {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');
        const resourceNamePrefix = `${systemName}-${envType}-`;

        return `${resourceNamePrefix}${originalName}`;
    }
}
```

抽象クラスを継承するよう各リソースクラスを書き換えます
  
`~/devio/lib/resource/vpc.ts`
```ts
import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Vpc extends Resource {
    public vpc: CfnVPC;

    constructor() {
        super();
     }

    public createResources(scope: Construct) {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');

        this.vpc = new CfnVPC(scope, 'Vpc', {
            cidrBlock: '10.0.0.0/19',
            tags: [{ key: 'Name', value: `${systemName}-${envType}-vpc` }]
        });
    }
}
```
  
`~/lib/resource/subnet.ts` 
```ts
import { Construct } from 'constructs';
import { CfnVPC,CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Subnet extends Resource {
    public PublicSubnetA: CfnSubnet;
    public PublicSubnetC: CfnSubnet;
    public PublicSubnetD: CfnSubnet;
    public ProtectedSubnetA: CfnSubnet;
    public ProtectedSubnetC: CfnSubnet;
    public ProtectedSubnetD: CfnSubnet;
    public PrivateSubnetA: CfnSubnet;
    public PrivateSubnetC: CfnSubnet;
    public PrivateSubnetD: CfnSubnet;

    private readonly vpc: CfnVPC;

    constructor(vpc: CfnVPC) {
        super();
        this.vpc = vpc;
    };

    public createResources(scope: Construct) {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');

        // サブネットのCIDRブロックを定義
        const CIDR = ['10.0.0.0/24', '10.0.1.0/24','10.0.2.0/24','10.0.3.0/24',
        '10.0.4.0/24','10.0.5.0/24','10.0.6.0/24','10.0.7.0/24',
        '10.0.8.0/24','10.0.9.0/24','10.0.10.0/24','10.0.11.0/24'];

        // サブネットのAZを定義
        const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];

        this.PublicSubnetA = new CfnSubnet(scope,'PublicSubnetA',{
        cidrBlock: CIDR[0],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1a`}]
        })
        this.PublicSubnetC = new CfnSubnet(scope,'PublicSubnetC',{
        cidrBlock: CIDR[1],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1c`}]
        })
        this.PublicSubnetD = new CfnSubnet(scope,'PublicSubnetD',{
        cidrBlock: CIDR[2],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1d`}]
        })
        this.ProtectedSubnetA = new CfnSubnet(scope,'ProtectedSubnetA',{
        cidrBlock: CIDR[4],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1a`}]
        })
        this.ProtectedSubnetC = new CfnSubnet(scope,'ProtectedSubnetC',{
        cidrBlock: CIDR[5],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1c`}]
        })
        this.ProtectedSubnetD = new CfnSubnet(scope,'ProtectedSubnetD',{
        cidrBlock: CIDR[6],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1d`}]
        })
        this.PrivateSubnetA = new CfnSubnet(scope,'PrivateSubnetA',{
        cidrBlock: CIDR[8],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1a`}]
        })
        this.PrivateSubnetC = new CfnSubnet(scope,'PrivateSubnetC',{
        cidrBlock: CIDR[9],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1c`}]
        })
        this.PrivateSubnetD = new CfnSubnet(scope,'PrivateSubnetD',{
        cidrBlock: CIDR[10],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1d`}]
        })
    }
}
```

# 実践！AWS CDK #11,#12,#13
参考URL:　　
https://dev.classmethod.jp/articles/cdk-practice-10-internet-gateway/  
https://dev.classmethod.jp/articles/cdk-practice-11-elastic-ip/  
https://dev.classmethod.jp/articles/cdk-practice-12-nat-gateway/  
https://dev.classmethod.jp/articles/cdk-practice-13-route-table/  

### 学び
* VPCの基本的なリソースの作成方法

### 作成リソース
今回は以下の構成図を作っていきます
![Untitled Diagram (3)](https://github.com/Yuhi-Sato/CDK-practice/assets/91863685/8b3658f3-b3f9-4952-8efe-d1691b9532df)

* InternetGateway
* EIP
* NatGateway
* RouteTable & Route

RoutetablePublic
|Destination|Targets|
| --- | --- |
| 10.0.0.0/19 | local |
| 0.0.0.0/0 | InternetGateway |  

RouteTableProtected
|Destination|Targets|
| --- | --- |
| 10.0.0.0/19 | local |
| 0.0.0.0/0 | NatGateway |

# 手順
リソース作成用のテンプレートを示します

`~/devio/lib/resource/internetGateway.ts`
```ts
import { Construct } from 'constructs';
import { CfnInternetGateway, CfnVPCGatewayAttachment, CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class InternetGateway extends Resource{
    public igw: CfnInternetGateway;

    private readonly vpc: CfnVPC;

    constructor(vpc: CfnVPC){
        super();
        this.vpc = vpc;
    }

    createResources(scope: Construct) {
        // インターネットゲートウェイを作成
        this.igw = new CfnInternetGateway(scope, 'InternetGateway', {
            tags: [{ key: 'Name', value: this.createResourceName(scope, 'igw') }]
        });

        // VPCへアタッチ
        new CfnVPCGatewayAttachment(scope, 'VpcGatewayAttachment', {
            vpcId: this.vpc.ref,
            internetGatewayId: this.igw.ref
        });
    }
} 
```

`~/devio/lib/resource/elasticIp.ts`
```ts
import { Construct } from 'constructs';
import { CfnEIP } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class ElasticIp extends Resource {
    public eip1a: CfnEIP;

    constructor(){
        super();
    }

    createResources(scope: Construct) {
        this.eip1a = new CfnEIP(scope,'ElasticIp1a',{
            tags: [{key: 'Name', value: this.createResourceName(scope,'eip-1a')}]
        })
    }
}
```

`~/devio/lib/resource/natGateway.ts`
```ts
import { Construct } from 'constructs';
import { CfnNatGateway, CfnSubnet, CfnEIP } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class NatGateway extends Resource {
    public ngw1a: CfnNatGateway;

    constructor(
        public PublicSubnetA: CfnSubnet,
        public eip1a: CfnEIP,){
        super();
    }

    createResources(scope: Construct): void {
        this.ngw1a = new CfnNatGateway(scope,'NatGateway1a',{
            allocationId: this.eip1a.attrAllocationId,
            subnetId: this.PublicSubnetA.attrSubnetId,
            tags: [{key: 'Name', value: this.createResourceName(scope,'nat-1a')}]
        })
    }
}
```

`~/devio/lib/resource/routeTable.ts`
```ts
import { Construct } from 'constructs';
import { 
    CfnRouteTable, 
    CfnRoute, 
    CfnSubnetRouteTableAssociation, 
    CfnVPC, 
    CfnSubnet, 
    CfnInternetGateway,
    CfnEIP, 
    CfnNatGateway} from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class RouteTable extends Resource {
    public RouteTablePublic: CfnRouteTable;
    public RouteTableProtected: CfnRouteTable;
    public RouteTablePrivate: CfnRouteTable;
    public RoutePublic: CfnRoute;
    public RoutePublicDefault: CfnRoute;
    public RouteProtected: CfnRoute;
    public RouteProtectedDefault: CfnRoute;
    public PublicSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;
    public ProtectedSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;
    public PrivateSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;

    constructor(
        private readonly vpc: CfnVPC,
        private readonly PublicSubnetA: CfnSubnet,
        private readonly PublicSubnetC: CfnSubnet,
        private readonly PublicSubnetD: CfnSubnet,
        private readonly ProtectedSubnetA: CfnSubnet,
        private readonly ProtectedSubnetC: CfnSubnet,
        private readonly ProtectedSubnetD: CfnSubnet,
        private readonly internetGateway: CfnInternetGateway,
        private readonly NatGateway1a: CfnNatGateway
    ){
        super();
    }
    
    createResources(scope: Construct): void {
        // ルートテーブルを作成
        this.RouteTablePublic = new CfnRouteTable(scope,'RouteTablePublic',{
            vpcId: this.vpc.attrVpcId,
            tags: [{key: 'Name', value: this.createResourceName(scope,'public-rtb')}] 
        });
        // デフォルトルートを作成
        this.RoutePublicDefault = new CfnRoute(scope,'RoutePublicDefault',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            gatewayId: this.internetGateway.attrInternetGatewayId,
            destinationCidrBlock: '0.0.0.0/0'
        });
        // ルートテーブルをサブネットにアタッチ
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1a',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetA.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1c',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetC.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1d',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetD.attrSubnetId
        });
        this.RouteTableProtected = new CfnRouteTable(scope,'RouteTableProtected',{
            vpcId: this.vpc.attrVpcId,
            tags: [{key: 'Name', value: this.createResourceName(scope,'protected-rtb')}] 
        });
        this.RouteProtectedDefault = new CfnRoute(scope,'RouteProtectedDefault',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            natGatewayId: this.NatGateway1a.attrNatGatewayId,
            destinationCidrBlock: '0.0.0.0/0'
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1a',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetA.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1c',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetC.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1d',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetD.attrSubnetId
        });
    }
}
```

`~/devio/lib/devio-stack.ts`
```ts
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './resource/vpc';
import { Subnet } from './resource/subnet';
import { InternetGateway } from './resource/internetGateway';
import { ElasticIp } from './resource/elasticIp';
import { NatGateway } from './resource/natGateway';
import { RouteTable } from './resource/routeTable';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc();
    vpc.createResources(this);

    // Subnet
    const subnet = new Subnet(vpc.vpc);
    subnet.createResources(this);

    // Internet Gateway
    const internetGateway = new InternetGateway(vpc.vpc);
    internetGateway.createResources(this);

    // EIP
    const elasticIp = new ElasticIp();
    elasticIp.createResources(this);

    // NAT
    const natGateway = new NatGateway(subnet.PrivateSubnetA,elasticIp.eip1a);
    natGateway.createResources(this);

    // Route Table
    const routeTable = new RouteTable(
      vpc.vpc,
      subnet.PublicSubnetA,
      subnet.PublicSubnetC,
      subnet.PublicSubnetD,
      subnet.ProtectedSubnetA,
      subnet.ProtectedSubnetC,
      subnet.ProtectedSubnetD,
      internetGateway.igw,
      natGateway.ngw1a);
      routeTable.createResources(this);
  }
}
```

以下はテストコードです

`~/devio/test/resources/internetGateway.test.ts`
```ts
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('InternetGateway', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    template.hasResourceProperties('AWS::EC2::InternetGateway',{
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-igw`}]
    });

    template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);

});
```

`~/devio/test/resources/elasticIp.test.ts`
```ts
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('ElasticIp', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::EIP', 1);
    template.hasResourceProperties('AWS::EC2::EIP',{
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-eip-1a`}]
    });
});
```

`~/devio/test/resources/natGateway.test.ts`
```ts
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('NatGateway', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::NatGateway', 1);
    template.hasResourceProperties('AWS::EC2::NatGateway',{
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-nat-1a`}]
    });
});
```

`~/devio/test/resources/routeTable.ts`
```ts
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('RouteTable', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::RouteTable', 6);

    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1d` }]
    });

    template.resourceCountIs('AWS::EC2::Route', 2);
    template.hasResourceProperties('AWS::EC2::Route', {
        "RouteTableId": Match.anyValue(),
        "DestinationCidrBlock": '0.0.0.0/0',
    });
    template.hasResourceProperties('AWS::EC2::Route', {
        "DestinationCidrBlock": '0.0.0.0/0',
        "RouteTableId": Match.anyValue(),
        "NatGatewayId": Match.anyValue(),
    });

    template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 6);
    template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
        "RouteTableId": Match.anyValue(),
        "SubnetId": Match.anyValue(),
    });
});
```
スタックをデプロイし、AWSコンソール画面を開くと以下のように正しくルーティングできていることが確認できます
![スクリーンショット 2023-06-25 18 00 49](https://github.com/Yuhi-Sato/CDK-practice/assets/91863685/e8170a51-1b09-4f36-80a2-8f273dbe8ed3)


