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