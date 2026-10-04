import { AuthController } from "./auth/presentation/auth.controller.js";
import { createAuthRouter } from "./auth/presentation/auth.routes.js";
import { AuthService } from "./auth/application/auth.service.js";
import { AuthRepositoryPg } from "./auth/infrastructure/auth.repository.js";
import { BrandController } from "./brand/presentation/brand.controller.js";
import { createBrandRouter } from "./brand/presentation/brand.routes.js";
import { BrandService } from "./brand/application/brand.service.js";
import { BrandRepositoryPg } from "./brand/infrastructure/brand.repository.js";
import { CategoryController } from "./category/presentation/category.controller.js";
import { createCategoryRouter } from "./category/presentation/category.routes.js";
import { CategoryService } from "./category/application/category.service.js";
import { CategoryRepositoryPg } from "./category/infrastructure/category.repository.js";
import { CustomerController } from "./customer/presentation/customer.controller.js";
import { createCustomerRouter } from "./customer/presentation/customer.routes.js";
import { CustomerService } from "./customer/application/customer.service.js";
import { CustomerRepositoryPg } from "./customer/infrastructure/customer.repository.js";
import { OrderController } from "./order/presentation/order.controller.js";
import { createOrderRouter } from "./order/presentation/order.routes.js";
import { OrderService } from "./order/application/order.service.js";
import { OrderRepositoryPg } from "./order/infrastructure/order.repository.js";
import { ProductController } from "./product/presentation/product.controller.js";
import { createProductRouter } from "./product/presentation/product.routes.js";
import { ProductService } from "./product/application/product.service.js";
import { ProductRepositoryPg } from "./product/infrastructure/product.repository.js";
import { RoleController } from "./role/presentation/role.controller.js";
import { createRoleRouter } from "./role/presentation/role.routes.js";
import { RoleService } from "./role/application/role.service.js";
import { RoleRepositoryPg } from "./role/infrastructure/role.repository.js";
import { StockController } from "./stock/presentation/stock.controller.js";
import { createStockRouter } from "./stock/presentation/stock.routes.js";
import { StockService } from "./stock/application/stock.service.js";
import { StockRepositoryPg } from "./stock/infrastructure/stock.repository.js";
import { UserController } from "./user/presentation/user.controller.js";
import { createUserRouter } from "./user/presentation/user.routes.js";
import { UserService } from "./user/application/user.service.js";
import { UserRepositoryPg } from "./user/infrastructure/user.repository.js";

/** The application composition root: adapters are selected and wired here. */
export function createModuleRouters() {
  const authRepository = new AuthRepositoryPg();
  const brandRepository = new BrandRepositoryPg();
  const categoryRepository = new CategoryRepositoryPg();
  const customerRepository = new CustomerRepositoryPg();
  const orderRepository = new OrderRepositoryPg();
  const productRepository = new ProductRepositoryPg();
  const roleRepository = new RoleRepositoryPg();
  const stockRepository = new StockRepositoryPg();
  const userRepository = new UserRepositoryPg();

  return {
    auth: createAuthRouter(new AuthController(new AuthService(authRepository))),
    users: createUserRouter(new UserController(new UserService(userRepository))),
    roles: createRoleRouter(new RoleController(new RoleService(roleRepository))),
    brands: createBrandRouter(new BrandController(new BrandService(brandRepository))),
    categories: createCategoryRouter(new CategoryController(new CategoryService(categoryRepository))),
    customers: createCustomerRouter(new CustomerController(new CustomerService(customerRepository))),
    products: createProductRouter(new ProductController(new ProductService(productRepository))),
    stocks: createStockRouter(new StockController(new StockService(stockRepository))),
    orders: createOrderRouter(new OrderController(new OrderService(orderRepository))),
  };
}
