import { Construct } from 'constructs';
import { 
    CfnRouteTable, 
    CfnRoute, 
    CfnSubnetRouteTableAssociation, 
    CfnVPC, 
    CfnSubnet, 
    CfnInternetGateway,
    CfnEIP, 
    CfnNatGateway} from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class RouteTable extends Resource {
    public RouteTablePublic: CfnRouteTable;
    public RouteTableProtected: CfnRouteTable;
    public RouteTablePrivate: CfnRouteTable;
    public RoutePublic: CfnRoute;
    public RoutePublicDefault: CfnRoute;
    public RouteProtected: CfnRoute;
    public RouteProtectedDefault: CfnRoute;
    public PublicSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;
    public ProtectedSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;
    public PrivateSubnetRouteTableAssociation: CfnSubnetRouteTableAssociation;

    constructor(
        private readonly vpc: CfnVPC,
        private readonly PublicSubnetA: CfnSubnet,
        private readonly PublicSubnetC: CfnSubnet,
        private readonly PublicSubnetD: CfnSubnet,
        private readonly ProtectedSubnetA: CfnSubnet,
        private readonly ProtectedSubnetC: CfnSubnet,
        private readonly ProtectedSubnetD: CfnSubnet,
        private readonly internetGateway: CfnInternetGateway,
        private readonly NatGateway1a: CfnNatGateway
    ){
        super();
    }
    
    createResources(scope: Construct): void {
        // ルートテーブルを作成
        this.RouteTablePublic = new CfnRouteTable(scope,'RouteTablePublic',{
            vpcId: this.vpc.attrVpcId,
            tags: [{key: 'Name', value: this.createResourceName(scope,'public-rtb')}] 
        });
        // デフォルトルートを作成
        this.RoutePublicDefault = new CfnRoute(scope,'RoutePublicDefault',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            gatewayId: this.internetGateway.attrInternetGatewayId,
            destinationCidrBlock: '0.0.0.0/0'
        });
        // ルートテーブルをサブネットにアタッチ
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1a',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetA.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1c',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetC.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'PublicSubnetRouteTableAssociation1d',{
            routeTableId: this.RouteTablePublic.attrRouteTableId,
            subnetId: this.PublicSubnetD.attrSubnetId
        });
        this.RouteTableProtected = new CfnRouteTable(scope,'RouteTableProtected',{
            vpcId: this.vpc.attrVpcId,
            tags: [{key: 'Name', value: this.createResourceName(scope,'protected-rtb')}] 
        });
        this.RouteProtectedDefault = new CfnRoute(scope,'RouteProtectedDefault',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            natGatewayId: this.NatGateway1a.attrNatGatewayId,
            destinationCidrBlock: '0.0.0.0/0'
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1a',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetA.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1c',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetC.attrSubnetId
        });
        new CfnSubnetRouteTableAssociation(scope, 'ProtectedSubnetRouteTableAssociation1d',{
            routeTableId: this.RouteTableProtected.attrRouteTableId,
            subnetId: this.ProtectedSubnetD.attrSubnetId
        });
    }
}