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

~/devio/lib/devio-stack.ts
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


~/devio/lib/devio-stack.ts
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

~/devio/test/devio.test.ts
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

~/devio/test/devio.test.tsの以下の部分でAWS::SQS::Queueのリソースが存在するかをテストしているが、このリソースを~/devio/lib/devio-stack.tsで定義していないため、テストが失敗している
```tsx
template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
});
```
~/devio/test/devio.test.tsを以下のように書き換える

~/devio/test/devio.test.ts
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
