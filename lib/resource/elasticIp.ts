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