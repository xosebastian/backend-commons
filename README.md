### Backend Commons (NestJS + Google Cloud Functions)

Librería de utilidades y módulos comunes para servicios basados en NestJS desplegados en Google Cloud Functions (GCF). Incluye logging estructurado compatible con Google Cloud Logging, contexto por request, configuración tipada, validación, filtros de excepciones, interceptores y utilidades.

### Características
- **Config**: Acceso tipado a variables de entorno (`AppConfigModule`, `AppConfigService`).
- **Logger (GCP)**: Pino con formato de severidad y `trace` en formato GCP cuando hay `traceId` y `GCP_PROJECT`/`GCLOUD_PROJECT`. **Incluye salida coloreada para desarrollo local**.
- **Request Context**: Contexto por invocación con `AsyncLocalStorage` (`RequestContextService`, `ContextInterceptor`).
- **Interceptors**: `LoggingInterceptor` para iniciar/finalizar logs de request.
- **Filtros**: `HttpExceptionFilter` para respuestas de error consistentes.
- **Validación**: `ValidationPipe` simple para DTOs.
- **Errores**: `AppError` y `ERROR_CODES` para códigos de error de dominio.
- **Utils**: `retry` para reintentos simples.

### Instalación

#### Instalación desde Azure Artifacts (producción)

```bash
npm install backend-commons
```

#### Instalación para desarrollo local

Para desarrollo sin publicar:

```bash
# Opción A: npm link (cambios en tiempo real)
cd backend-commons
npm link
cd ../mi-proyecto
npm link @epago/backend-commons

# Opción B: desde tarball local
cd backend-commons
npm pack
cd ../mi-proyecto
npm install ../backend-commons/epago-backend-commons-1.0.2.tgz
```

**Nota:** Para deslinkear: `npm unlink @epago/backend-commons` en el consumidor, `npm unlink` en la librería.

#### Configuración de .npmrc para Azure Artifacts

En proyectos consumidores, crea `.npmrc`:

```ini
@epago:registry=https://pkgs.dev.azure.com/IRCorporativo/_packaging/IRCorporativo/npm/registry/
always-auth=true
```

Para autenticación local:
```bash
npm install -g vsts-npm-auth --unsafe-perm=true
vsts-npm-auth -config .npmrc
```

Requisitos de entorno mínimos:
- Node 18+ recomendado (para despliegue en GCF, usar la versión soportada por tu runtime).
- Variables de entorno opcionales: `LOG_LEVEL`, `GCP_PROJECT` o `GCLOUD_PROJECT`, `SERVICE_NAME`.

### Logging con colores para desarrollo local

El logger incluye soporte automático para salida coloreada cuando se ejecuta en desarrollo local. Las características incluyen:

- **Detección automática**: Se activa cuando `NODE_ENV` no es `production` ni `staging`
- **Colores por nivel**: Diferentes colores para info, warn, error, debug y verbose
- **Formato legible**: Timestamps en formato legible y mensajes estructurados
- **Compatibilidad**: Mantiene el formato JSON estructurado en producción

Para probar los logs coloreados localmente:

```bash
# En tu aplicación NestJS
NODE_ENV=development npm start

# Si los colores no se muestran, puedes forzarlos con:
FORCE_COLOR=1 NODE_ENV=development npm start
```

### Uso básico en NestJS

Importa los módulos globales y registra interceptores/filtros:

```ts
import { Module } from '@nestjs/common';
import {
  AppConfigModule,
  GcpLoggerModule,
  RequestContextModule,
  LoggingInterceptor,
  ContextInterceptor,
  HttpExceptionFilter,
} from 'backend-commons';

@Module({
  imports: [AppConfigModule, GcpLoggerModule, RequestContextModule],
})
export class AppModule {}
```

En el bootstrap (main.ts):

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ContextInterceptor, LoggingInterceptor, HttpExceptionFilter, GcpLoggerService } from 'backend-commons';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(GcpLoggerService);
  app.useLogger(logger);
  app.useGlobalInterceptors(app.get(ContextInterceptor), app.get(LoggingInterceptor));
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  await app.init();
}

bootstrap();
```

### Uso en Google Cloud Functions

Para funciones HTTP, el `ContextInterceptor` extrae `x-request-id` y `x-cloud-trace-context` automáticamente si el adaptador HTTP de Nest expone los headers. Asegúrate de propagar los headers desde GCF al request Nest.

El logger incluirá el campo `trace` cuando haya `traceId` y `GCP_PROJECT`/`GCLOUD_PROJECT` esté definido, con el formato `projects/${projectId}/traces/${traceId}` para correlación en Cloud Logging/Trace.

#### Adaptadores listos para GCF

- HTTP:

```ts
import { createGcfHttpHandler } from 'backend-commons';

// tras app.init()
export const httpHandler = createGcfHttpHandler(app);
// En index.ts de tu función HTTP de GCF:
exports.myHttpFunction = httpHandler;
```

- Background (Pub/Sub, Storage, etc.):

```ts
import { createGcfBackgroundHandler } from 'backend-commons';

const background = createGcfBackgroundHandler(app, async (event) => {
  // tu lógica usando event.data
});

exports.myBackgroundFunction = background;
```

### API Exportada

- Config: `AppConfigModule`, `AppConfigService`
- Logger: `GcpLoggerModule`, `GcpLoggerService`
- Contexto: `RequestContextModule`, `RequestContextService`
- Interceptors: `ContextInterceptor`, `LoggingInterceptor`
- Filtros: `HttpExceptionFilter`
- Validación: `ValidationPipe`
- Errores: `AppError`, `ERROR_CODES`
- Utils: `retry`

### Aplicación de ejemplo

En la carpeta `example` se incluye una aplicación NestJS que integra todos los módulos de la librería.
Para ejecutarla localmente:

```bash
npm install
npx ts-node example/src/main.ts
```

### Ejemplos de uso

Log básico con metadatos:

```ts
constructor(private readonly logger: GcpLoggerService) {}

this.logger.log({ msg: 'user:created', userId: '123' });
this.logger.warn({ msg: 'rate:limited', userId: '123', limit: 100 });
this.logger.error({ msg: 'db:error', op: 'saveUser' });
```

Acceso a configuración tipada:

```ts
constructor(private readonly config: AppConfigService) {}

const { nodeEnv, serviceName, logLevel } = this.config.getAll();
```

Validación de DTO sin `ValidationPipe` global:

```ts
const pipe = new ValidationPipe();
const dto = await pipe.transform(input, { type: 'body', metatype: CreateUserDto });
```

Reintento simple:

```ts
const { result, error, attempts } = await retry(() => callExternalAPI(), { retries: 3, delayMs: 200 });
```

### Buenas prácticas
- Usar `RequestContextService` para correlacionar logs con `requestId`/`traceId`.
- Definir `SERVICE_NAME` y `LOG_LEVEL` por entorno.
- Propagar `x-request-id` y `x-cloud-trace-context` desde el edge (API Gateway/Load Balancer/Function invoker).

### Desarrollo

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

### Pruebas

Para ejecutar la suite de tests:

```bash
npm test
```

Para modo watch:

```bash
npm run test:watch
```

La cobertura se genera en `coverage/`.


### Roadmap
- Validación de configuración con esquema y soporte para Secret Manager.
- Redacción de PII en logs (Pino redact) configurable por entorno.
- Interceptores adicionales: timeout y transform.
- Pub/Sub: publisher/subscriber tipado y utilidades de idempotencia/deduplicación.
- Propagación de tracing (trace/span) y helper para Error Reporting.
- Health checks para dependencias externas.
- Pipes y DTOs base (UUID, enteros, fechas, paginación, filtros estándar).

### Licencia
ISC
