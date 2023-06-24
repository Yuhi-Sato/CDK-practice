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
## Fine-grained assertions
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
![image](https://github.com/Yuhi-Sato/CDK-practice/assets/91863685/b3127991-1da1-47d8-af56-7a108df02238)


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
    const CIDR = ['10.0.0.0/24', '10.0.0.1/24','10.0.0.2/24','10.0.0.3/24',
    '10.0.0.4/24','10.0.0.5/24','10.0.0.6/24','10.0.0.7/24',
    '10.0.0.8/24','10.0.0.9/24','10.0.0.10/24','10.0.0.11/24'];

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

テストコード
```tsx
import * as cdk from 'aws-cdk-lib';
import { Match,Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../lib/devio-stack';

test('Vpc', () => {
    const app = new cdk.App({
      context: {
          'systemName': 'devio',
          'envType': 'stg'
      }
  });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    // サブネットのCIDRブロックを定義
    const CIDR = ['10.0.0.0/24', '10.0.0.1/24','10.0.0.2/24','10.0.0.3/24',
    '10.0.0.4/24','10.0.0.5/24','10.0.0.6/24','10.0.0.7/24',
    '10.0.0.8/24','10.0.0.9/24','10.0.0.10/24','10.0.0.11/24'];

    // サブネットのAZを定義
    const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];
  
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 9);

    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-public-subnet-1a' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.1/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-public-subnet-1c' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.2/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-public-subnet-1d' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.4/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-protected-subnet-1a' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.5/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-protected-subnet-1c' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.6/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-protected-subnet-1d' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.8/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-private-subnet-1a' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.9/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-private-subnet-1c' }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.10/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': 'devio-stg-private-subnet-1d' }]
    });
});
```
