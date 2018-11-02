const server = require('./server');
const ds = server.dataSources.postgresql;
const lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', 'account', 'company', 'driver', 'quote', 'service', 'vehicleType', 'vehicle'];

ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});