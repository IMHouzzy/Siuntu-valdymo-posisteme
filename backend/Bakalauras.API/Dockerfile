FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Bakalauras.API/Bakalauras.API.csproj Bakalauras.API/
RUN dotnet restore Bakalauras.API/Bakalauras.API.csproj

COPY . .
RUN dotnet publish Bakalauras.API/Bakalauras.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libfontconfig1 libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
EXPOSE 5065
ENTRYPOINT ["dotnet", "Bakalauras.API.dll"]
