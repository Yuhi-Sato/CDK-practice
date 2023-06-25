import { Construct } from 'constructs';
import { CfnVPC,CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Subnet extends Resource {
    public PublicSubnetA: CfnSubnet;
    public PublicSubnetC: CfnSubnet;
    public PublicSubnetD: CfnSubnet;
    public ProtectedSubnetA: CfnSubnet;
    public ProtectedSubnetC: CfnSubnet;
    public ProtectedSubnetD: CfnSubnet;
    public PrivateSubnetA: CfnSubnet;
    public PrivateSubnetC: CfnSubnet;
    public PrivateSubnetD: CfnSubnet;

    private readonly vpc: CfnVPC;

    constructor(vpc: CfnVPC) {
        super();
        this.vpc = vpc;
    };

    public createResources(scope: Construct) {
        const systemName = scope.node.tryGetContext('systemName');
        const envType = scope.node.tryGetContext('envType');

        // サブネットのCIDRブロックを定義
        const CIDR = ['10.0.0.0/24', '10.0.1.0/24','10.0.2.0/24','10.0.3.0/24',
        '10.0.4.0/24','10.0.5.0/24','10.0.6.0/24','10.0.7.0/24',
        '10.0.8.0/24','10.0.9.0/24','10.0.10.0/24','10.0.11.0/24'];

        // サブネットのAZを定義
        const AZ = ['ap-northeast-1a', 'ap-northeast-1c', 'ap-northeast-1d'];

        this.PublicSubnetA = new CfnSubnet(scope,'PublicSubnetA',{
        cidrBlock: CIDR[0],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1a`}]
        })
        this.PublicSubnetC = new CfnSubnet(scope,'PublicSubnetC',{
        cidrBlock: CIDR[1],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1c`}]
        })
        this.PublicSubnetD = new CfnSubnet(scope,'PublicSubnetD',{
        cidrBlock: CIDR[2],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-public-subnet-1d`}]
        })
        this.ProtectedSubnetA = new CfnSubnet(scope,'ProtectedSubnetA',{
        cidrBlock: CIDR[4],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1a`}]
        })
        this.ProtectedSubnetC = new CfnSubnet(scope,'ProtectedSubnetC',{
        cidrBlock: CIDR[5],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1c`}]
        })
        this.ProtectedSubnetD = new CfnSubnet(scope,'ProtectedSubnetD',{
        cidrBlock: CIDR[6],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-protected-subnet-1d`}]
        })
        this.PrivateSubnetA = new CfnSubnet(scope,'PrivateSubnetA',{
        cidrBlock: CIDR[8],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[0],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1a`}]
        })
        this.PrivateSubnetC = new CfnSubnet(scope,'PrivateSubnetC',{
        cidrBlock: CIDR[9],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[1],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1c`}]
        })
        this.PrivateSubnetD = new CfnSubnet(scope,'PrivateSubnetD',{
        cidrBlock: CIDR[10],
        vpcId: this.vpc.ref,
        availabilityZone: AZ[2],
        tags: [{key:'Name',value:`${systemName}-${envType}-private-subnet-1d`}]
        })
    }
}