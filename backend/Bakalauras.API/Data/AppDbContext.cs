using System;
using System.Collections.Generic;
using Bakalauras.API.Models;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace Bakalauras.API.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<admin> admins { get; set; }

    public virtual DbSet<category> categories { get; set; }

    public virtual DbSet<client> clients { get; set; }

    public virtual DbSet<employee> employees { get; set; }

    public virtual DbSet<order> orders { get; set; }

    public virtual DbSet<ordersproduct> ordersproducts { get; set; }

    public virtual DbSet<orderstatus> orderstatuses { get; set; }

    public virtual DbSet<product> products { get; set; }

    public virtual DbSet<productgroup> productgroups { get; set; }

    public virtual DbSet<users> users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;port=3306;database=siuntu_valdymo_posistemis;user=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.32-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<admin>(entity =>
        {
            entity.HasKey(e => e.id_Users).HasName("PRIMARY");

            entity.ToTable("admin");

            entity.Property(e => e.id_Users)
                .ValueGeneratedNever()
                .HasColumnType("int(11)");

            entity.HasOne(d => d.id_UsersNavigation).WithOne(p => p.admin)
                .HasForeignKey<admin>(d => d.id_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("admin_ibfk_1");
        });

        modelBuilder.Entity<category>(entity =>
        {
            entity.HasKey(e => e.id_Category).HasName("PRIMARY");

            entity.ToTable("category");

            entity.Property(e => e.id_Category)
                .ValueGeneratedNever()
                .HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);

            entity.HasMany(d => d.fk_Productid_Products).WithMany(p => p.fk_Categoryid_Categories)
                .UsingEntity<Dictionary<string, object>>(
                    "productcategory",
                    r => r.HasOne<product>().WithMany()
                        .HasForeignKey("fk_Productid_Product")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Has_products"),
                    l => l.HasOne<category>().WithMany()
                        .HasForeignKey("fk_Categoryid_Category")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Has_categories"),
                    j =>
                    {
                        j.HasKey("fk_Categoryid_Category", "fk_Productid_Product")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("productcategory");
                        j.HasIndex(new[] { "fk_Productid_Product" }, "Has_products");
                        j.IndexerProperty<int>("fk_Categoryid_Category").HasColumnType("int(11)");
                        j.IndexerProperty<int>("fk_Productid_Product").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<client>(entity =>
        {
            entity.HasKey(e => e.id_Users).HasName("PRIMARY");

            entity.ToTable("client");

            entity.HasIndex(e => e.externalClientId, "externalClientId").IsUnique();

            entity.Property(e => e.id_Users)
                .ValueGeneratedNever()
                .HasColumnType("int(11)");
            entity.Property(e => e.bankCode).HasColumnType("int(5)");
            entity.Property(e => e.city).HasMaxLength(255);
            entity.Property(e => e.code).HasColumnType("bigint(10)");
            entity.Property(e => e.country).HasMaxLength(255);
            entity.Property(e => e.daysBuyer).HasColumnType("int(11)");
            entity.Property(e => e.daysSupplier).HasColumnType("int(11)");
            entity.Property(e => e.deliveryAddress).HasMaxLength(255);
            entity.Property(e => e.externalClientId).HasColumnType("int(11)");
            entity.Property(e => e.maxDebt).HasColumnType("int(11)");
            entity.Property(e => e.userId).HasColumnType("int(11)");
            entity.Property(e => e.vat).HasMaxLength(255);

            entity.HasOne(d => d.id_UsersNavigation).WithOne(p => p.client)
                .HasForeignKey<client>(d => d.id_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("client_ibfk_1");
        });

        modelBuilder.Entity<employee>(entity =>
        {
            entity.HasKey(e => e.id_Users).HasName("PRIMARY");

            entity.ToTable("employee");

            entity.Property(e => e.id_Users)
                .ValueGeneratedNever()
                .HasColumnType("int(11)");
            entity.Property(e => e.active)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.position).HasMaxLength(255);

            entity.HasOne(d => d.id_UsersNavigation).WithOne(p => p.employee)
                .HasForeignKey<employee>(d => d.id_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("employee_ibfk_1");
        });

        modelBuilder.Entity<order>(entity =>
        {
            entity.HasKey(e => e.id_Orders).HasName("PRIMARY");

            entity.HasIndex(e => e.externalDocumentId, "UX_orders_externalDocumentId").IsUnique();

            entity.HasIndex(e => e.fk_Clientid_Users, "fk_Clientid_Users");

            entity.HasIndex(e => e.status, "status");

            entity.Property(e => e.id_Orders).HasColumnType("int(11)").ValueGeneratedOnAdd();
            entity.Property(e => e.externalDocumentId).HasColumnType("int(11)");
            entity.Property(e => e.fk_Clientid_Users).HasColumnType("int(11)");
            entity.Property(e => e.fk_Reportid_Report).HasColumnType("int(11)");
            entity.Property(e => e.paymentMethod).HasMaxLength(255);
            entity.Property(e => e.status).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_Clientid_UsersNavigation).WithMany(p => p.orders)
                .HasForeignKey(d => d.fk_Clientid_Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("orders_ibfk_2");

            entity.HasOne(d => d.statusNavigation).WithMany(p => p.orders)
                .HasForeignKey(d => d.status)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("orders_ibfk_1");
        });

        modelBuilder.Entity<ordersproduct>(entity =>
        {
            entity.HasKey(e => e.id_OrdersProduct).HasName("PRIMARY");

            entity.ToTable("ordersproduct");

            entity.HasIndex(e => e.fk_Ordersid_Orders, "fk_Ordersid_Orders");

            entity.HasIndex(e => e.fk_Productid_Product, "fk_Productid_Product");

            entity.Property(e => e.id_OrdersProduct)
                .ValueGeneratedOnAdd()
                .HasColumnType("int(11)");
            entity.Property(e => e.fk_Ordersid_Orders).HasColumnType("int(11)");
            entity.Property(e => e.fk_Productid_Product).HasColumnType("int(11)");
            entity.Property(e => e.quantity).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_Ordersid_OrdersNavigation).WithMany(p => p.ordersproducts)
                .HasForeignKey(d => d.fk_Ordersid_Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ordersproduct_ibfk_1");

            entity.HasOne(d => d.fk_Productid_ProductNavigation).WithMany(p => p.ordersproducts)
                .HasForeignKey(d => d.fk_Productid_Product)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ordersproduct_ibfk_2");
        });

        modelBuilder.Entity<orderstatus>(entity =>
        {
            entity.HasKey(e => e.id_OrderStatus).HasName("PRIMARY");

            entity.ToTable("orderstatus");

            entity.Property(e => e.id_OrderStatus)
                .ValueGeneratedNever()
                .HasColumnType("int(11)");
            entity.Property(e => e.name)
                .HasMaxLength(21)
                .IsFixedLength();
        });

        modelBuilder.Entity<product>(entity =>
        {
            entity.HasKey(e => e.id_Product).HasName("PRIMARY");

            entity.ToTable("product");

            entity.HasIndex(e => e.externalCode, "uq_product_externalCode").IsUnique();

            entity.Property(e => e.id_Product).HasColumnType("int(11)");
            entity.Property(e => e.description).HasMaxLength(255);
            entity.Property(e => e.externalCode).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.picture).HasMaxLength(255);
            entity.Property(e => e.shipping_mode).HasMaxLength(255);
            entity.Property(e => e.unit)
                .HasMaxLength(6)
                .HasDefaultValueSql("'vnt'");

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
                        j.HasIndex(new[] { "fk_Productid_Product" }, "idx_ppg_productId");
                        j.IndexerProperty<int>("fk_Productid_Product").HasColumnType("int(11)");
                        j.IndexerProperty<int>("fk_ProductGroupId_ProductGroup").HasColumnType("int(11)");
                    });
        });

        modelBuilder.Entity<productgroup>(entity =>
        {
            entity.HasKey(e => e.id_ProductGroup).HasName("PRIMARY");

            entity.ToTable("productgroup");

            entity.Property(e => e.id_ProductGroup).HasColumnType("int(11)");
            entity.Property(e => e.name).HasMaxLength(255);
        });

        modelBuilder.Entity<users>(entity =>
        {
            entity.HasKey(e => e.id_Users).HasName("PRIMARY");

            entity.Property(e => e.id_Users).HasColumnType("int(11)");
            entity.Property(e => e.authProvider)
                .HasMaxLength(50)
                .HasDefaultValueSql("'LOCAL'");
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.googleId).HasMaxLength(255);
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.password).HasMaxLength(255);
            entity.Property(e => e.phoneNumber).HasMaxLength(255);
            entity.Property(e => e.surname).HasMaxLength(255);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
