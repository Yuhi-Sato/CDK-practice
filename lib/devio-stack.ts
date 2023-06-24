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
