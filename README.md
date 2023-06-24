# 実践！AWS CDK #1 導入
参考URL:https://dev.classmethod.jp/articles/cdk-practice-1-introduction/

### 手順
`npm install -g aws-cdk`

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

`cdk synth`

`cdk deploy`

`cdk destroy`
