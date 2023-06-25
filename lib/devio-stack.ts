import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './resource/vpc';
import { Subnet } from './resource/subnet';
import { InternetGateway } from './resource/internetGateway';
import { ElasticIp } from './resource/elasticIp';
import { NatGateway } from './resource/natGateway';
import { RouteTable } from './resource/routeTable';

export class DevioStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc();
    vpc.createResources(this);

    // Subnet
    const subnet = new Subnet(vpc.vpc);
    subnet.createResources(this);

    // Internet Gateway
    const internetGateway = new InternetGateway(vpc.vpc);
    internetGateway.createResources(this);

    // EIP
    const elasticIp = new ElasticIp();
    elasticIp.createResources(this);

    // NAT
    const natGateway = new NatGateway(subnet.PrivateSubnetA,elasticIp.eip1a);
    natGateway.createResources(this);

    // Route Table
    const routeTable = new RouteTable(
      vpc.vpc,
      subnet.PublicSubnetA,
      subnet.PublicSubnetC,
      subnet.PublicSubnetD,
      subnet.ProtectedSubnetA,
      subnet.ProtectedSubnetC,
      subnet.ProtectedSubnetD,
      internetGateway.igw,
      natGateway.ngw1a);
      routeTable.createResources(this);
  }
}