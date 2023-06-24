# 実践！AWS CDK #1 導入

参考 URL:https://dev.classmethod.jp/articles/cdk-practice-1-introduction/

### 学び

- CDK 上でプログラミング言語(今回は TypeScript)で CloudFormation のスタックを作成し、デプロイが可能
- CDK 上では Construct 単位でコンポーネントを管理している
- Construct には L1, L2, L3 の 3 つのレイヤーがある

### 手順

CDK をインストール  
`npm install -g aws-cdk`

ディレクトリを作成し、移動  
`mkdir devio && cd devio`

CDK V2 のままだとエラーが起こるため、バージョンを 1.104.0 に揃える  
`npx aws-cdk@1.104.0 init app --language typescrip`

```tsx
import * as cdk from "@aws-cdk/core";
import { Vpc } from "@aws-cdk/aws-ec2"; // <- 追加

export class DevioStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Vpc(this, "Vpc"); // <- 追加
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

参考 URL:https://dev.classmethod.jp/articles/cdk-practice-2-vpc/

### 学び

- L1 は L2 よりもカスタマイズ性が高い
- VPC リソースに対応する L1Construct は CfnVPC

### 手順

scope の参照型が異なる？みたいで this にエラーが起こっていたため、「〜/devio/node_modules/@aws-cdk/aws-ec2/core」ディレクトリを「~/devio/node_modules/@aws-cdk」直下に移動しました。

```tsx
import * as cdk from "@aws-cdk/core";
import { CfnVPC } from "@aws-cdk/aws-ec2";

export class DevioStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CfnVPC(this, "Vpc", {
      cidrBlock: "10.0.0.0/19",
      tags: [{ key: "Name", value: "devio-stg-vpc" }],
    });
  }
}
```

cidrBlock は「10.0.0.0/16」だと大きすぎる気がするので「10.0.0.0/19」に変更しました。

# 実践！AWS CDK #3 テスト

参考 URL:https://dev.classmethod.jp/articles/cdk-practice-3-test/
