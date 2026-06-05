# Program.cs Order

`Program.cs` has two important ordering sections:

1. Service registration, before `builder.Build()`
2. Middleware pipeline, after `builder.Build()`

Service registration order is mostly about making dependencies clear. Middleware order is stricter because each request flows through the middleware from top to bottom.

## Service Registration Order

Current order:

```csharp
builder.Services.AddDbContext<AppDBContext>(...);
builder.Services.AddControllers().AddJsonOptions(...);
builder.Services.AddCors(...);
builder.Services.AddRouting(...);
builder.Services.AddIdentityCore<AppUser>(...);
builder.Services.AddAuthentication(...).AddJwtBearer(...);
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(...);
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<LogUserActivity>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<ILikesRepository, LikesReporitory>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.Configure<CloudinarySettings>(...);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(...);
```

Why this order is used:

- `AddDbContext` is registered first because Identity, repositories, and startup migration code all depend on `AppDBContext`.
- `AddControllers` is registered once and includes the UTC JSON converter used by API responses.
- `AddCors` and `AddRouting` are registered before the middleware pipeline uses `UseCors` and `UseRouting`.
- `AddIdentityCore` comes before JWT authentication because Identity provides user and role services backed by the database.
- `AddAuthentication` registers the JWT bearer handler, which reads and validates tokens.
- `AddAuthorizationBuilder` registers the role and policy rules used by `[Authorize]` attributes.
- Application services and repositories are registered after the framework security services they rely on.
- Swagger is registered last because it describes the already configured API and security scheme.

## AddAuthorization vs AddAuthorizationBuilder

Both methods register authorization services and both can be used to add policies.

`AddAuthorization` uses an options callback:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));
});
```

`AddAuthorizationBuilder` returns an `AuthorizationBuilder`, so policies can be chained:

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
    .AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));
```

Why this project uses `AddAuthorizationBuilder`:

- It is cleaner when registering multiple policies because each `.AddPolicy(...)` call can be chained.
- It keeps the authorization setup focused on authorization rules instead of wrapping them inside an `options` block.
- It still works with the same `[Authorize]` attributes in controllers.

The behavior is the same for these policies. `RequireAdminRole` still requires the `Admin` role, and `ModeratePhotoRole` still allows either `Admin` or `Moderator`.

## Middleware Pipeline Order

Current order:

```csharp
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

Why this order is required:

- `ExceptionMiddleware` is first so it can catch exceptions from later middleware and controller actions.
- Swagger runs early in Development so `/swagger` requests can be handled before normal API endpoint execution.
- `UseHttpsRedirection` runs before request handling so HTTP requests are redirected to HTTPS early.
- `UseRouting` selects the matching endpoint and makes endpoint metadata available to later middleware.
- `UseCors` runs after routing so it can use endpoint metadata, and before authentication/authorization so browser preflight requests can succeed.
- `UseAuthentication` runs before authorization because it reads the JWT and sets `HttpContext.User`.
- `UseAuthorization` runs after authentication because it checks the populated user against roles and policies.
- `MapControllers` is last so controller actions execute only after routing, CORS, authentication, and authorization have run.

The most important rule is:

```csharp
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

Authentication answers "Who are you?" Authorization answers "What are you allowed to do?" That is why authentication must always come before authorization.
