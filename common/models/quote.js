'use strict';
const axios = require('axios');

function formatMoney(n, c, d, t) {
  var c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;

  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

module.exports = function(quote) {

  //  CALCULATE NEW QUOTE
  // =================================

  quote.calculate = function(origin, destination, distance, vehicleType, cb) {

    const VehicleTypeModel = quote.app.models.VehicleType;
    const distanceInKm = (distance / 1000)

    VehicleTypeModel.findOne({
      where: {
        id: vehicleType,
      },
    }).then(function(vehicle) {
      const distancePrice = distanceInKm * vehicle.pricePerKm;

      let totalPrice = parseInt(vehicle.premium) + parseInt(distancePrice);
      totalPrice = formatMoney(totalPrice);

      const quote = {
        origin,
        destination,
        vehicle,
        totalPrice,
        distance: distanceInKm,
      };
      
      cb(null, quote);
    });
  };

  // Register new method
  quote.remoteMethod('calculate', {
    accepts: [
      {arg: 'origin', type: 'object'},
      {arg: 'destination', type: 'object'},
      {arg: 'distance', type: 'number'},
      {arg: 'vehicleType', type: 'string'},
    ],
    returns: {arg: 'data', type: 'object'},
  });

  
  // SAVE NEW QUOTE
  // =================================
  
  quote.new = function(name, email, phone, origin, destination, distance, vehicleType, totalPrice, startDate, cb) {

    const User = quote.app.models.User;
    const Account = quote.app.models.Account;
    const distanceInKm = (distance / 1000)
    
    // Find or create user
    User.findOrCreate({
      where: {
        email,
      },
    }, {
      email,
      password: 'dh23k£k5!h8dh£)id'
    }).then((users) => {
      console.log('users', users);

      // Find or create account
      Account.findOrCreate({
        where: {
          userId: users[0].id,
        },
      }, {
        fullName: name,
        userId: users[0].id
      }).then((accounts) => {
        console.log('accounts', accounts);
        // Create quote
        quote.create({
          client: accounts[0].id,
          origin,
          destination,
          distance,
          vehicleType,
          totalPrice,
          startDate,
        }).then((quote) => {
          console.log('quote', quote);
          const personURL = 'https://superfletescom.pipedrive.com/v1/persons?api_token=82cacc1f964da681ad219ca076ac200d059f0c26';
          const Person = {
            name: name,
            email: [email],
            phone: [phone],
          };
          axios.post(personURL, Person)
          .then((person) => {
            console.log('person', person);
            const leadURL = 'https://superfletescom.pipedrive.com/v1/deals?api_token=82cacc1f964da681ad219ca076ac200d059f0c26';
            const Lead = {
              'title': name,
              'person_id': person.data.id,
              'value': totalPrice,
              // Name
              '1cadadcbc4d14aa354f178de47df6ee03902f181': name,
              // Phone
              '1c4511eed74ede0dafd32a7cd6ce4ec1c20956ca': phone,
              // Email
              '47853ee6dbe4879dbb6720c1f28760cb0640a299': email,
              // VehicleType
              '5615208dc49b4c35584d33725431dd84248878a0': vehicleType,
              // Origin
              'ff1ccd533a11a01de28ffe78cedf276694c2f8a0': origin.address,
              // Destination
              '3fad63036206dbff03db051f431b46389f3145da': destination.address,
              // Distance
              'e043b601a3fa3ec6434a90ad7071b23d6bafcf42': distanceInKm,
              // Date
              '9b99cbb00204d55b8da8c57b3c61a7982282178f': startDate,
            };
            axios.post(leadURL, Lead)
            .then((lead) => {
              console.log('lead', lead);

              cb(null, quote);

            });
          })
          .catch(error => {
            console.log(error);
          });
        })
        .catch(error => {
          console.log(error);
        });
      })
      .catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });
  };
  
  // Register new method
  quote.remoteMethod('new', {
    accepts: [
      {arg: 'name', type: 'string'},
      {arg: 'email', type: 'string'},
      {arg: 'phone', type: 'string'},
      {arg: 'origin', type: 'object'},
      {arg: 'destination', type: 'object'},
      {arg: 'distance', type: 'number'},
      {arg: 'vehicleType', type: 'number'},
      {arg: 'totalPrice', type: 'string'},
      {arg: 'startDate', type: 'string'},
    ],
    returns: {arg: 'data', type: 'object'},
  });

};
