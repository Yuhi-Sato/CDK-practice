# 実践！AWS CDK #1 導入
参考URL:https://dev.classmethod.jp/articles/cdk-practice-1-introduction/

### 学び
* CDK上でプログラミング言語(今回はTypeScript)でCloudFormationのスタックを作成し、デプロイが可能
* CDK上ではConstruct単位でコンポーネントを管理している
* ConstructにはL1, L2, L3の3つのレイヤーがある

### 手順
CDKをインストール  
`npm install -g aws-cdk`  

ディレクトリを作成し、移動  
`mkdir devio && cd devio`  

CDK V2のままだとエラーが起こるため、バージョンを1.104.0に揃える  
`npx aws-cdk@1.104.0 init app --language typescrip`

```tsx  
import * as cdk from '@aws-cdk/core';
import { Vpc } from '@aws-cdk/aws-ec2'; // <- 追加

export class DevioStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Vpc(this, 'Vpc'); // <- 追加
  }
}
```
CFnのテンプレートを作成  
`cdk synth`

CFnで定義したリソースをデプロイ  
`cdk deploy`

CFnで作成したリソースを削除  
`cdk destroy`

# 実践！AWS CDK #2 VPC
参考URL
https://dev.classmethod.jp/articles/cdk-practice-2-vpc/

### 学び
* L1はL2よりもカスタマイズ性が高い
* VPCリソースに対応するL1ConstructはCfnVPC


### 手順

scopeの参照型が異なる？みたいでthisにエラーが起こっていたため、「〜/devio/node_modules/@aws-cdk/aws-ec2/core」ディレクトリを「~/devio/node_modules/@aws-cdk」直下に移動しました。  

「10.0.0.0/16」だと大きすぎる気がするので「10.0.0.0/19」に変更しました。

```tsx  
import * as cdk from '@aws-cdk/core';
import { CfnVPC } from '@aws-cdk/aws-ec2';

export class DevioStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CfnVPC(this, 'Vpc', {
      cidrBlock: '10.0.0.0/19',
      tags: [{ key: 'Name', value: 'devio-stg-vpc' }]
    });
  }
}
```

# 実践！AWS CDK #3 テスト
参考URLhttps://dev.classmethod.jp/articles/cdk-practice-3-test/
