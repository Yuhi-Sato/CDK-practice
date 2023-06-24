import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC,CfnSubnet } from 'aws-cdk-lib/aws-ec2';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const systemName = this.node.tryGetContext('systemName');
    const envType = this.node.tryGetContext('envType');

    // VPCを定義
    const vpc = new CfnVPC(this, "Vpc", { 
      cidrBlock: "10.0.0.0/19",
      tags: [{ key: "Name", value: `${systemName}-${envType}-vpc` }],
    });

    // サブネットのCIDRブロックを定義
    const CIDR = ['10.0.0.0/24', '10.0.1.0/24','10.0.2.0/24','10.0.3.0/24',
    '10.0.4.0/24','10.0.5.0/24','10.0.6.0/24','10.0.7.0/24',
    '10.0.8.0/24','10.0.9.0/24','10.0.10.0/24','10.0.11.0/24'];

    // サブネットのAZを定義
    const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];

    const PublicSubnetA = new CfnSubnet(this,'PublicSubnetA',{
      cidrBlock: CIDR[0],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1a`}]
    });
    const PublicSubnetC = new CfnSubnet(this,'PublicSubnetC',{
      cidrBlock: CIDR[1],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1c`}]
    });
    const PublicSubnetD = new CfnSubnet(this,'PublicSubnetD',{
      cidrBlock: CIDR[2],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1d`}]
    });
    const ProtectedSubnetA = new CfnSubnet(this,'ProtectedSubnetA',{
      cidrBlock: CIDR[4],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1a`}]
    });
    const ProtectedSubnetC = new CfnSubnet(this,'ProtectedSubnetC',{
      cidrBlock: CIDR[5],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1c`}]
    });
    const ProtectedSubnetD = new CfnSubnet(this,'ProtectedSubnetD',{
      cidrBlock: CIDR[6],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1d`}]
    });
    const PrivateSubnetA = new CfnSubnet(this,'PrivateSubnetA',{
      cidrBlock: CIDR[8],
      vpcId: vpc.ref,
      availabilityZone: AZ[0],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1a`}]
    });
    const PrivateSubnetC = new CfnSubnet(this,'PrivateSubnetC',{
      cidrBlock: CIDR[9],
      vpcId: vpc.ref,
      availabilityZone: AZ[1],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1c`}]
    });
    const PrivateSubnetD = new CfnSubnet(this,'PrivateSubnetD',{
      cidrBlock: CIDR[10],
      vpcId: vpc.ref,
      availabilityZone: AZ[2],
      tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1d`}]
    });

  }
}
