using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace Bakalauras.API.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<category> categories { get; set; }

    public virtual DbSet<client_company> client_companies { get; set; }

    public virtual DbSet<company> companies { get; set; }

    public virtual DbSet<company_integration> company_integrations { get; set; }

    public virtual DbSet<company_user> company_users { get; set; }

    public virtual DbSet<courier> couriers { get; set; }

    public virtual DbSet<order> orders { get; set; }

    public virtual DbSet<ordersproduct> ordersproducts { get; set; }

    public virtual DbSet<orderstatus> orderstatuses { get; set; }

    public virtual DbSet<package> packages { get; set; }

    public virtual DbSet<product> products { get; set; }

    public virtual DbSet<product_image> product_images { get; set; }

    public virtual DbSet<product_return> product_returns { get; set; }

    public virtual DbSet<productgroup> productgroups { get; set; }

    public virtual DbSet<return_item> return_items { get; set; }

    public virtual DbSet<return_status_type> return_status_types { get; set; }

    public virtual DbSet<shipment> shipments { get; set; }

    public virtual DbSet<shipment_status> shipment_statuses { get; set; }

    public virtual DbSet<shipment_status_type> shipment_status_types { get; set; }

    public virtual DbSet<user> users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;port=3306;database=siuntu_valdymo_posistemis;user=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.32-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<category>(entity =>
        {
            entity.HasKey(e => e.id_Category).HasName("PRIMARY");

            entity.ToTable("category");

            entity.Property(e => e.id_Category).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);

            entity.HasMany(d => d.fk_Productid_Products).WithMany(p => p.fk_Categoryid_Categories)
                .UsingEntity<Dictionary<string, object>>(
                    "productcategory",
                    r => r.HasOne<product>().WithMany()
                        .HasForeignKey("fk_Productid_Product")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_productcategory_product"),
                    l => l.HasOne<category>().WithMany()
                        .HasForeignKey("fk_Categoryid_Category")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_productcategory_category"),
                    j =>
                    {
                        j.HasKey("fk_Categoryid_Category", "fk_Productid_Product")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("productcategory");
                        j.HasIndex(new[] { "fk_Productid_Product" }, "IX_productcategory_product");
                        j.IndexerProperty<int>("fk_Categoryid_Category").HasColumnType("int(11)");
                        j.IndexerProperty<int>("fk_Productid_Product").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<client_company>(entity =>
        {
            entity.HasKey(e => new { e.fk_Clientid_Users, e.fk_Companyid_Company })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.ToTable("client_company");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_client_company_company");

            entity.HasIndex(e => new { e.fk_Companyid_Company, e.externalClientId }, "UX_client_company_externalClientId").IsUnique();

            entity.Property(e => e.fk_Clientid_Users).HasColumnType("int(11)");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.bankCode).HasColumnType("int(5)");
            entity.Property(e => e.city).HasMaxLength(255);
            entity.Property(e => e.country).HasMaxLength(255);
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.deliveryAddress).HasMaxLength(255);
            entity.Property(e => e.externalClientId).HasColumnType("int(11)");
            entity.Property(e => e.vat).HasMaxLength(255);

            entity.HasOne(d => d.fk_Clientid_UsersNavigation).WithMany(p => p.client_companies)
                .HasForeignKey(d => d.fk_Clientid_Users)
                .HasConstraintName("FK_client_company_user");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.client_companies)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .HasConstraintName("FK_client_company_company");
        });

        modelBuilder.Entity<company>(entity =>
        {
            entity.HasKey(e => e.id_Company).HasName("PRIMARY");

            entity.ToTable("company");

            entity.HasIndex(e => e.companyCode, "UQ_company_code").IsUnique();

            entity.Property(e => e.id_Company).HasColumnType("int(11)");
            entity.Property(e => e.active)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.address).HasMaxLength(255);
            entity.Property(e => e.companyCode).HasMaxLength(100);
            entity.Property(e => e.creationDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.documentCode).HasMaxLength(100);
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.image)
                .HasMaxLength(255)
                .HasDefaultValueSql("''");
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.phoneNumber).HasMaxLength(255);
            entity.Property(e => e.returnAddress).HasMaxLength(255);
            entity.Property(e => e.shippingAddress).HasMaxLength(255);
        });

        modelBuilder.Entity<company_integration>(entity =>
        {
            entity.HasKey(e => e.id_CompanyIntegration).HasName("PRIMARY");

            entity.ToTable("company_integration");

            entity.HasIndex(e => new { e.fk_Companyid_Company, e.type }, "UX_company_integration").IsUnique();

            entity.Property(e => e.id_CompanyIntegration).HasColumnType("int(11)");
            entity.Property(e => e.baseUrl).HasMaxLength(500);
            entity.Property(e => e.enabled)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.encryptedSecrets).HasColumnType("text");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.type).HasMaxLength(50);
            entity.Property(e => e.updatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.company_integrations)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .HasConstraintName("FK_company_integration_company");
        });

        modelBuilder.Entity<company_user>(entity =>
        {
            entity.HasKey(e => new { e.fk_Companyid_Company, e.fk_Usersid_Users })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });

            entity.HasIndex(e => e.fk_Usersid_Users, "IX_company_users_user");

            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.fk_Usersid_Users).HasColumnType("int(11)");
            entity.Property(e => e.active)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.position).HasMaxLength(255);
            entity.Property(e => e.role)
                .HasMaxLength(50)
                .HasDefaultValueSql("'CLIENT'");
            entity.Property(e => e.startDate).HasColumnType("datetime");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.company_users)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .HasConstraintName("FK_company_users_company");

            entity.HasOne(d => d.fk_Usersid_UsersNavigation).WithMany(p => p.company_users)
                .HasForeignKey(d => d.fk_Usersid_Users)
                .HasConstraintName("FK_company_users_users");
        });

        modelBuilder.Entity<courier>(entity =>
        {
            entity.HasKey(e => e.id_Courier).HasName("PRIMARY");

            entity.ToTable("courier");

            entity.HasIndex(e => e.name, "IX_courier_name");

            entity.Property(e => e.id_Courier).HasColumnType("int(11)");
            entity.Property(e => e.contactPhone).HasMaxLength(50);
            entity.Property(e => e.deliveryTermDays).HasColumnType("int(11)");
        });

        modelBuilder.Entity<order>(entity =>
        {
            entity.HasKey(e => e.id_Orders).HasName("PRIMARY");

            entity.HasIndex(e => e.fk_Clientid_Users, "IX_orders_client");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_orders_company");

            entity.HasIndex(e => e.status, "IX_orders_status");

            entity.HasIndex(e => new { e.fk_Companyid_Company, e.externalDocumentId }, "UX_orders_company_externalDocumentId").IsUnique();

            entity.Property(e => e.id_Orders).HasColumnType("int(11)");
            entity.Property(e => e.OrdersDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.externalDocumentId).HasColumnType("int(11)");
            entity.Property(e => e.fk_Clientid_Users).HasColumnType("int(11)");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.fk_Reportid_Report).HasColumnType("int(11)");
            entity.Property(e => e.paymentMethod).HasMaxLength(255);
            entity.Property(e => e.status).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_Clientid_UsersNavigation).WithMany(p => p.orders)
                .HasForeignKey(d => d.fk_Clientid_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orders_client");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.orders)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orders_company");

            entity.HasOne(d => d.statusNavigation).WithMany(p => p.orders)
                .HasForeignKey(d => d.status)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orders_status");
        });

        modelBuilder.Entity<ordersproduct>(entity =>
        {
            entity.HasKey(e => e.id_OrdersProduct).HasName("PRIMARY");

            entity.ToTable("ordersproduct");

            entity.HasIndex(e => e.fk_Ordersid_Orders, "IX_op_order");

            entity.HasIndex(e => e.fk_Productid_Product, "IX_op_product");

            entity.Property(e => e.id_OrdersProduct).HasColumnType("int(11)");
            entity.Property(e => e.fk_Ordersid_Orders).HasColumnType("int(11)");
            entity.Property(e => e.fk_Productid_Product).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_Ordersid_OrdersNavigation).WithMany(p => p.ordersproducts)
                .HasForeignKey(d => d.fk_Ordersid_Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_op_orders");

            entity.HasOne(d => d.fk_Productid_ProductNavigation).WithMany(p => p.ordersproducts)
                .HasForeignKey(d => d.fk_Productid_Product)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_op_product");
        });

        modelBuilder.Entity<orderstatus>(entity =>
        {
            entity.HasKey(e => e.id_OrderStatus).HasName("PRIMARY");

            entity.ToTable("orderstatus");

            entity.Property(e => e.id_OrderStatus).HasColumnType("int(11)");
            entity.Property(e => e.name)
                .HasMaxLength(21)
                .IsFixedLength();
        });

        modelBuilder.Entity<package>(entity =>
        {
            entity.HasKey(e => e.id_Package).HasName("PRIMARY");

            entity.ToTable("package");

            entity.HasIndex(e => e.fk_Shipmentid_Shipment, "IX_package_shipment");

            entity.Property(e => e.id_Package).HasColumnType("int(11)");
            entity.Property(e => e.creationDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fk_Shipmentid_Shipment).HasColumnType("int(11)");
            entity.Property(e => e.labelFile).HasMaxLength(500);

            entity.HasOne(d => d.fk_Shipmentid_ShipmentNavigation).WithMany(p => p.packages)
                .HasForeignKey(d => d.fk_Shipmentid_Shipment)
                .HasConstraintName("FK_package_shipment");
        });

        modelBuilder.Entity<product>(entity =>
        {
            entity.HasKey(e => e.id_Product).HasName("PRIMARY");

            entity.ToTable("product");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_product_company");

            entity.HasIndex(e => new { e.fk_Companyid_Company, e.externalCode }, "UX_product_company_externalCode").IsUnique();

            entity.Property(e => e.id_Product).HasColumnType("int(11)");
            entity.Property(e => e.creationDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.currency).HasMaxLength(15);
            entity.Property(e => e.description).HasMaxLength(255);
            entity.Property(e => e.externalCode).HasColumnType("int(11)");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.picture).HasMaxLength(255);
            entity.Property(e => e.shipping_mode).HasMaxLength(255);
            entity.Property(e => e.unit)
                .HasMaxLength(6)
                .HasDefaultValueSql("'vnt'");
            entity.Property(e => e.vat)
                .IsRequired()
                .HasDefaultValueSql("'1'");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.products)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_product_company");

            entity.HasMany(d => d.fk_ProductGroupId_ProductGroups).WithMany(p => p.fk_Productid_Products)
                .UsingEntity<Dictionary<string, object>>(
                    "product_productgroup",
                    r => r.HasOne<productgroup>().WithMany()
                        .HasForeignKey("fk_ProductGroupId_ProductGroup")
                        .HasConstraintName("fk_ppg_productgroup"),
                    l => l.HasOne<product>().WithMany()
                        .HasForeignKey("fk_Productid_Product")
                        .HasConstraintName("fk_ppg_product"),
                    j =>
                    {
                        j.HasKey("fk_Productid_Product", "fk_ProductGroupId_ProductGroup")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("product_productgroup");
                        j.HasIndex(new[] { "fk_ProductGroupId_ProductGroup" }, "idx_ppg_productGroupId");
                        j.IndexerProperty<int>("fk_Productid_Product").HasColumnType("int(11)");
                        j.IndexerProperty<int>("fk_ProductGroupId_ProductGroup").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<product_image>(entity =>
        {
            entity.HasKey(e => e.id_ProductImage).HasName("PRIMARY");

            entity.HasIndex(e => e.isPrimary, "IX_product_images_isPrimary");

            entity.HasIndex(e => e.fk_Productid_Product, "IX_product_images_product");

            entity.HasIndex(e => new { e.fk_Productid_Product, e.sortOrder }, "IX_product_images_sortOrder");

            entity.Property(e => e.id_ProductImage).HasColumnType("int(11)");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fk_Productid_Product).HasColumnType("int(11)");
            entity.Property(e => e.sortOrder).HasColumnType("int(11)");
            entity.Property(e => e.url).HasMaxLength(500);

            entity.HasOne(d => d.fk_Productid_ProductNavigation).WithMany(p => p.product_images)
                .HasForeignKey(d => d.fk_Productid_Product)
                .HasConstraintName("FK_product_images_product");
        });

        modelBuilder.Entity<product_return>(entity =>
        {
            entity.HasKey(e => e.id_Returns).HasName("PRIMARY");

            entity.HasIndex(e => e.fk_Adminid_Users, "IX_returns_admin");

            entity.HasIndex(e => e.fk_Clientid_Users, "IX_returns_client");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_returns_company");

            entity.HasIndex(e => e.fk_ReturnStatusTypeid_ReturnStatusType, "IX_returns_status");

            entity.Property(e => e.id_Returns).HasColumnType("int(11)");
            entity.Property(e => e.date)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fk_Adminid_Users).HasColumnType("int(11)");
            entity.Property(e => e.fk_Clientid_Users).HasColumnType("int(11)");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.fk_ReturnStatusTypeid_ReturnStatusType).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_Adminid_UsersNavigation).WithMany(p => p.product_returnfk_Adminid_UsersNavigations)
                .HasForeignKey(d => d.fk_Adminid_Users)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_returns_admin");

            entity.HasOne(d => d.fk_Clientid_UsersNavigation).WithMany(p => p.product_returnfk_Clientid_UsersNavigations)
                .HasForeignKey(d => d.fk_Clientid_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_returns_client");

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.product_returns)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_returns_company");

            entity.HasOne(d => d.fk_ReturnStatusTypeid_ReturnStatusTypeNavigation).WithMany(p => p.product_returns)
                .HasForeignKey(d => d.fk_ReturnStatusTypeid_ReturnStatusType)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_returns_status_type");
        });

        modelBuilder.Entity<productgroup>(entity =>
        {
            entity.HasKey(e => e.id_ProductGroup).HasName("PRIMARY");

            entity.ToTable("productgroup");

            entity.Property(e => e.id_ProductGroup).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);
        });

        modelBuilder.Entity<return_item>(entity =>
        {
            entity.HasKey(e => e.id_ReturnItem).HasName("PRIMARY");

            entity.ToTable("return_item");

            entity.HasIndex(e => e.fk_OrdersProductid_OrdersProduct, "IX_ri_ordersproduct");

            entity.HasIndex(e => e.fk_Returnsid_Returns, "IX_ri_return");

            entity.Property(e => e.id_ReturnItem).HasColumnType("int(11)");
            entity.Property(e => e.fk_OrdersProductid_OrdersProduct).HasColumnType("int(11)");
            entity.Property(e => e.fk_Returnsid_Returns).HasColumnType("int(11)");
            entity.Property(e => e.quantity).HasColumnType("int(11)");
            entity.Property(e => e.reason).HasMaxLength(255);

            entity.HasOne(d => d.fk_OrdersProductid_OrdersProductNavigation).WithMany(p => p.return_items)
                .HasForeignKey(d => d.fk_OrdersProductid_OrdersProduct)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ri_ordersproduct");

            entity.HasOne(d => d.fk_Returnsid_ReturnsNavigation).WithMany(p => p.return_items)
                .HasForeignKey(d => d.fk_Returnsid_Returns)
                .HasConstraintName("FK_ri_returns");
        });

        modelBuilder.Entity<return_status_type>(entity =>
        {
            entity.HasKey(e => e.id_ReturnStatusType).HasName("PRIMARY");

            entity.ToTable("return_status_type");

            entity.HasIndex(e => e.name, "UQ_return_status_type_name").IsUnique();

            entity.Property(e => e.id_ReturnStatusType).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(50);
        });

        modelBuilder.Entity<shipment>(entity =>
        {
            entity.HasKey(e => e.id_Shipment).HasName("PRIMARY");

            entity.ToTable("shipment");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_shipment_company");

            entity.HasIndex(e => e.fk_Courierid_Courier, "IX_shipment_courier");

            entity.HasIndex(e => e.fk_Ordersid_Orders, "IX_shipment_order");

            entity.HasIndex(e => e.trackingNumber, "UQ_shipment_trackingNumber").IsUnique();

            entity.Property(e => e.id_Shipment).HasColumnType("int(11)");
            entity.Property(e => e.estimatedDeliveryDate).HasColumnType("datetime");
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.fk_Courierid_Courier).HasColumnType("int(11)");
            entity.Property(e => e.fk_Ordersid_Orders).HasColumnType("int(11)");
            entity.Property(e => e.shippingDate).HasColumnType("datetime");
            entity.Property(e => e.trackingNumber).HasMaxLength(100);

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.shipments)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_shipment_company");

            entity.HasOne(d => d.fk_Courierid_CourierNavigation).WithMany(p => p.shipments)
                .HasForeignKey(d => d.fk_Courierid_Courier)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_shipment_courier");

            entity.HasOne(d => d.fk_Ordersid_OrdersNavigation).WithMany(p => p.shipments)
                .HasForeignKey(d => d.fk_Ordersid_Orders)
                .HasConstraintName("FK_shipment_orders");
        });

        modelBuilder.Entity<shipment_status>(entity =>
        {
            entity.HasKey(e => e.id_ShipmentStatus).HasName("PRIMARY");

            entity.ToTable("shipment_status");

            entity.HasIndex(e => e.date, "IX_ss_date");

            entity.HasIndex(e => e.fk_Shipmentid_Shipment, "IX_ss_shipment");

            entity.HasIndex(e => e.fk_ShipmentStatusTypeid_ShipmentStatusType, "IX_ss_type");

            entity.Property(e => e.id_ShipmentStatus).HasColumnType("int(11)");
            entity.Property(e => e.date)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fk_ShipmentStatusTypeid_ShipmentStatusType).HasColumnType("int(11)");
            entity.Property(e => e.fk_Shipmentid_Shipment).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_ShipmentStatusTypeid_ShipmentStatusTypeNavigation).WithMany(p => p.shipment_statuses)
                .HasForeignKey(d => d.fk_ShipmentStatusTypeid_ShipmentStatusType)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ss_type");

            entity.HasOne(d => d.fk_Shipmentid_ShipmentNavigation).WithMany(p => p.shipment_statuses)
                .HasForeignKey(d => d.fk_Shipmentid_Shipment)
                .HasConstraintName("FK_ss_shipment");
        });

        modelBuilder.Entity<shipment_status_type>(entity =>
        {
            entity.HasKey(e => e.id_ShipmentStatusType).HasName("PRIMARY");

            entity.ToTable("shipment_status_type");

            entity.HasIndex(e => e.name, "UQ_shipment_status_type_name").IsUnique();

            entity.Property(e => e.id_ShipmentStatusType).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(50);
        });

        modelBuilder.Entity<user>(entity =>
        {
            entity.HasKey(e => e.id_Users).HasName("PRIMARY");

            entity.HasIndex(e => e.fk_Companyid_Company, "IX_users_company");

            entity.Property(e => e.id_Users).HasColumnType("int(11)");
            entity.Property(e => e.authProvider)
                .HasMaxLength(50)
                .HasDefaultValueSql("'LOCAL'");
            entity.Property(e => e.creationDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.fk_Companyid_Company).HasColumnType("int(11)");
            entity.Property(e => e.googleId).HasMaxLength(255);
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.password).HasMaxLength(255);
            entity.Property(e => e.phoneNumber).HasMaxLength(255);
            entity.Property(e => e.surname).HasMaxLength(255);

            entity.HasOne(d => d.fk_Companyid_CompanyNavigation).WithMany(p => p.users)
                .HasForeignKey(d => d.fk_Companyid_Company)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_users_company");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
