<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://cdn.prod.website-files.com/62e443aeb2cdfb6f2b0306a5/65cd2448467950674f70e3db_cocosLogos%20p%20caso%20de%20exito.png" width="250" alt="Nest Logo" /></a>
</p>
  
## Secciones 📘

- [1. Setup del proyecto](#setup-del-proyecto)
- [2. Tests](#tests)
- [3. Arquitectura de la aplicación](#arquitectura-de-la-aplicación)
- [4. Conceptos clave](#conceptos-clave)
- [5. Decisiones de diseño](#decisiones-de-diseño)

## Setup del proyecto 💻

Crear un archivo `.env` en la carpeta root del proyecto con las siguientes variables (se puede utilizar el archivo `.env.example` como referencia):

```yaml
NODE_ENV=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cocos_challenge
DB_USERNAME=cocos_user
DB_PASSWORD=cocos_password
```

### Setup local (con Docker) 🐳
#### Requisitos
- Docker
- docker-compose

El proyecto cuenta con un archivo `docker-compose.yml` que contiene lo necesario para correr la aplicación y la base de datos. Para levantar el proyecto utilizando Docker ejecutar los siguientes comandos en la terminal:

```bash
docker-compose build
docker-compose up
```

Las migraciones se ejecutan automáticamente al levantar el contenedor.

### Setup local (sin Docker) 🏠
#### Requisitos
- Node 22+
- Yarn/npm
- Postgres 15

Luego, ejecutar los siguientes comandos en la terminal:

```bash
yarn install
yarn db:migrate

yarn start:dev
```

----------

### Tests 🧪

Para correr los **tests unitarios**, ejecutar el siguiente comando en la terminal:

```bash
yarn test:unit
```

Para correr los **tests de integración**, asegurarse que la BD esté levantada de forma local o mediante Docker, y ejecutar el siguiente comando en la terminal:

```bash
yarn test:integration
```

----------

### Arquitectura de la aplicación 🏛️

La aplicación está construida con NestJS (Node.js/TypeScript) y utiliza PostgreSQL como base de datos con Kysely como query builder.

### Arquitectura por Capas (Layered Architecture)

#### 1. API Layer
/api/: Controladores REST que exponen endpoints

OrdersController: Gestión de órdenes (crear/cancelar)
MarketController: Consulta de instrumentos y datos de mercado
UsersController: Gestión de usuarios y sus portfolios
DTOs: Objetos de transferencia de datos con validación usando class-validator

#### 2. Application Layer
/application/services/: Actuan como orquestadores y puentes entre la API layer y la Domain layer
OrderApplicationService: Coordina la creación y cancelación de órdenes
MarketApplicationService: Maneja consultas de mercado
PortfolioApplicationService: Gestiona portafolios de usuarios

#### 3. Domain Layer

Encapsula las reglas de negocio y los requerimientos funcionales de la aplicación.

/domain/models/: Entidades de negocio (Order, User, Instrument, etc.)
/domain/services/: Servicios de dominio con lógica específica
OrderManagementService: Validación y cálculo de órdenes
CashPositionService: Cálculo de posiciones de efectivo
StockPositionService: Cálculo de posiciones de acciones
/domain/repositories/: Interfaces para acceso a datos
/domain/queries/: Objetos de consulta especializados

#### 4. Infrastructure layer 

Implementaciones concretas de repositorios y comunicación con servicios externos en caso de existir. 

-----------

### Conceptos clave 🔑

- **Inversión de dependencias**: Las capas superiores dependen de abstracciones, no de implementaciones, implementada utilizando utilizando dependency injection.
- **Inyección de dependencias**: Uso de tokens para desacoplar interfaces de implementaciones
- **Separación de responsabilidades**: Cada capa tiene una responsabilidad específica
- **Enfoque Domain-Driven Design**: Si bien no se distinguen bounded contexts específicos dado el tamaño del proyecto, se hace foco en encapsular y enriquecer la capa de dominio particularmente.
- **Repository Pattern**: Abstrae el acceso a datos con interfaces
- **Query Objects**: Encapsula lógica de consultas complejas

Esta arquitectura permite un código mantenible, testeable y escalable, siguiendo principios SOLID y Clean Architecture.

-----------

### Decisiones de diseño ℹ️

Si bien algunas decisiones pueden parecer un overkill para el tamaño del proyecto, decidí utilizar los enfoques y patrones que creo son útiles en una aplicación productiva de mediano/gran tamaño. Algunas de ellas fueron:

- **Opté por utilizar Kysely en reemplazo de un ORM** para tener control total sobre el acceso a los datos y no depender de las queries generadas por un ORM. Las queries son definidas siguiendo el patrón QueryObject, que permite expresar las queries en lenguaje de dominio.
- Opté por la arquitectura Layered Architecture porque creo que tiene muchas ventajas a nivel de organización y escalabilidad del proyecto ante la estructura `controllers > services > repositories`, sobre todo en etapas avanzadas de los proyectos
- Dependency inversion: definir las interfaces y los contratos en la capa de dominio, y las implementaciones en la capa de infraestructura permite desacoplar el dominio de nuestra aplicación completamente de la capa de persistencia y/o de servicios externos.
- DB: agregué índices únicamente sobre las columnas utilizadas en las queries definidas.

------------

### Cuestiones a considerar ⚠️

- Se debe agregar **autenticación y autorización de usuarios**. En este momento se permite la consulta del portfolio y la creación de órdenes para cualquier usuario.
- En este proyecto **no se simula la ejecución de la orden en el mercado per-se**, y tampoco se establece un mecanismo de comunicación para marcar órdenes LIMIT como REJECTED o FILLED de forma asíncrona. La implementación de este mecanismo seguramente esté atada al proveedor, pero algunas alternativas pueden ser:
    - Exponer un webhook `/order/filled` y `/order/rejected`
    - Escuchar eventos del tipo `ORDER_FILLED` o `ORDER_REJECTED`
    - Utilizar el protocolo FIX
