import * as cdk from 'aws-cdk-lib';
import { Match,Template } from 'aws-cdk-lib/assertions';
import * as Devio from '../lib/devio-stack';
import {systemName,envType} from './env';

test('Vpc', () => {
    const app = new cdk.App({
      context: {
          'systemName': 'devio',
          'envType': 'stg'
      }
  });
    const stack = new Devio.DevioStack(app, 'DevioStack');
    const template = Template.fromStack(stack);
  
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 9);

    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.0.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.1.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.2.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-public-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.4.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.5.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.6.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-protected-subnet-1d` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.8.0/24',
        "AvailabilityZone": 'ap-northeast-1a',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1a` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.9.0/24',
        "AvailabilityZone": 'ap-northeast-1c',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1c` }]
    });
    template.hasResourceProperties('AWS::EC2::Subnet', {
        "CidrBlock": '10.0.10.0/24',
        "AvailabilityZone": 'ap-northeast-1d',
        "Tags": [{ 'Key': 'Name', 'Value': `${systemName}-${envType}-private-subnet-1d` }]
    });
});
