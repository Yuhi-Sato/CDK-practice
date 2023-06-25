import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Devio from '../../lib/devio-stack';
import {systemName,envType} from '../env';

test('RouteTable', () => {
    const app = new cdk.App({
        context: {
            'systemName': 'devio',
            'envType': 'stg'
        }
    });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::RouteTable', 6);

    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-rtb-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::RouteTable', {
        "VpcId": '10.0.0.0/19',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-rtb-1d` }]
    });

    template.resourceCountIs('AWS::EC2::Route', 2);
    template.hasResourceProperties('AWS::EC2::Route', {
        "RouteTableId": Match.anyValue(),
        "DestinationCidrBlock": '0.0.0.0/0',
    });
    template.hasResourceProperties('AWS::EC2::Route', {
        "DestinationCidrBlock": '0.0.0.0/0',
        "RouteTableId": Match.anyValue(),
        "NatGatewayId": Match.anyValue(),
    });

    template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 6);
    template.hasResourceProperties('AWS::EC2::SubnetRouteTableAssociation', {
        "RouteTableId": Match.anyValue(),
        "SubnetId": Match.anyValue(),
    });
});