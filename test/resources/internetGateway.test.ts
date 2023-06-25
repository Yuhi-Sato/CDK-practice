import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('InternetGateway', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    template.hasResourceProperties('AWS::EC2::InternetGateway',{
        "Tags": [{'Key': 'Name', 'Value': `${systemName}-${envType}-igw`}]
    });

    template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);

});
