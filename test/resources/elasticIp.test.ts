import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('ElasticIp', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::EIP', 1);
    template.hasResourceProperties('AWS::EC2::EIP',{
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-eip-1a`}]
    });
});
