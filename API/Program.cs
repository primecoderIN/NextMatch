using API.Data;
using API.Interfaces;
using API.Services;
using API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using API.Helpers;

var builder = WebApplication.CreateBuilder(args);


//Formatting all time to proper utc date time in apis
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });

/* =======================
   CORS
   ======================= */
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowCredentials();
    });
});

/* =======================
   Authentication (JWT)
   ======================= */
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var tokenKey = builder.Configuration["TokenKey"]
            ?? throw new Exception("TokenKey not found in configuration");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(tokenKey)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

/* =======================
   Authorization
   ======================= */
builder.Services.AddAuthorization();

// 

builder.Services.AddScoped<IPhotoService, PhotoService>();

builder.Services.AddScoped<IMemberRepository, MemberRepository>();

builder.Services.AddScoped<ILikesRepository,LikesReporitory>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings")); //Key should be same as app settings

/* =======================
   Routing
   ======================= */
builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

/* =======================
   Database
   ======================= */
   //This options are passed to the base DbContext constructor in AppDBContext, which is required for EF Core to function properly.
   //Because AppDBContext needs to know how to conect to the dabatase. 
builder.Services.AddDbContext<AppDBContext>(options =>
{
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

/* =======================
   Application Services
   ======================= */
   //This service is needed to generate JWT tokens for user authentication. By registering it in the dependency injection container, we can easily inject it into our controllers and other services where we need to create tokens for authenticated users. This allows us to centralize our token generation logic and makes it easier to maintain and update in the future if needed.
builder.Services.AddScoped<ITokenService, TokenService>(); //Scoped means a new instance of the service will be created for each HTTP request, and that same instance will be used throughout the entire request. This is useful for services that need to maintain state or perform operations that are specific to a single request, such as database contexts or services that handle user authentication. By using scoped services, we can ensure that each request gets its own instance of the service, which can help prevent issues with shared state and improve the overall performance and reliability of the application.

builder.Services.AddScoped<LogUserActivity>();

/* =======================
   Controllers
   ======================= */
builder.Services.AddControllers();

var app = builder.Build();

/* =======================
   Middleware Pipeline
   ======================= */

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection(); //Not required if we enforce https in angular dev server, but good to have in production environment

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication(); // Who are you
app.UseAuthorization();  // What are you allowed to do

app.MapControllers();

//Creating scope outside http request pipeline to do migrations
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<AppDBContext>();
    await context.Database.MigrateAsync(); //Asynchronously applies pending migrations
    await Seed.SeedUsers(context);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();
