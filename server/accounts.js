ServiceConfiguration.configurations.remove({
  service: "instagram"
});

ServiceConfiguration.configurations.insert({
  service: "instagram",
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  scope: "basic",
  secret: process.env.INSTAGRAM_CLIENT_SECRET
});
