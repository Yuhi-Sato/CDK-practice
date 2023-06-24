import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CfnVPC(this, "Vpc", {
      cidrBlock: "10.0.0.0/19",
      tags: [{ key: "Name", value: "devio-stg-vpc" }],
    });
  }
}
