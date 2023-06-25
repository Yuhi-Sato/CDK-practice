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