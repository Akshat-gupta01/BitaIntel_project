'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('businesses', [
      { name: 'Meridian Steel Works', city: 'Pune', state: 'Maharashtra', status: 'Approved', score: 82, level: 3 },
      { name: 'Nexora IT Solutions', city: 'Bengaluru', state: 'Karnataka', status: 'Approved', score: 90, level: 4 },
      { name: 'CircuitCraft Electronics', city: 'Noida', state: 'Uttar Pradesh', status: 'Approved', score: 83, level: 3 },
      { name: 'Harvest & Co. Foods', city: 'Ludhiana', state: 'Punjab', status: 'Under Review', score: 51, level: 0 },
      { name: 'Vireo Pharma Labs', city: 'Hyderabad', state: 'Telangana', status: 'Approved', score: 83, level: 4 },
      { name: 'Trackline Logistics', city: 'Ahmedabad', state: 'Gujarat', status: 'Clarification Required', score: 51, level: 0 },
      { name: 'Woven Threads Textile', city: 'Surat', state: 'Gujarat', status: 'Approved', score: 85, level: 4 },
      { name: 'Bastion Construction Co.', city: 'Lucknow', state: 'Uttar Pradesh', status: 'Rejected', score: 59, level: 0 },
      { name: 'ProPack Industries', city: 'Chennai', state: 'Tamil Nadu', status: 'Approved', score: 82, level: 3 },
      { name: 'Unimart Wholesale Trade', city: 'Delhi', state: 'Delhi', status: 'Approved', score: 85, level: 4 },
      { name: 'Solaris Components Ltd.', city: 'Jaipur', state: 'Rajasthan', status: 'Approved', score: 88, level: 4 },
      { name: 'GreenLeaf Agro Foods', city: 'Nashik', state: 'Maharashtra', status: 'Approved', score: 88, level: 4 },
      { name: 'Falcon Freight Systems', city: 'Indore', state: 'Madhya Pradesh', status: 'Approved', score: 86, level: 4 },
      { name: 'Bytewise Software Pvt Ltd', city: 'Pune', state: 'Maharashtra', status: 'Under Review', score: 54, level: 0 },
      { name: 'Ironclad Fabricators', city: 'Coimbatore', state: 'Tamil Nadu', status: 'Approved', score: 88, level: 4 },
      { name: 'Radiant Textile Mills', city: 'Kanpur', state: 'Uttar Pradesh', status: 'Clarification Required', score: 58, level: 0 },
      { name: 'Zenith Pharma Exports', city: 'Vadodara', state: 'Gujarat', status: 'Approved', score: 85, level: 4 },
      { name: 'Stonebridge Infra Co.', city: 'Bhopal', state: 'Madhya Pradesh', status: 'Rejected', score: 52, level: 0 },
      { name: 'Cartonex Packaging Ltd.', city: 'Kolkata', state: 'West Bengal', status: 'Approved', score: 81, level: 4 },
      { name: 'Metro Wholesale Hub', city: 'Mumbai', state: 'Maharashtra', status: 'Approved', score: 87, level: 4 }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('businesses', null, {});
  }
};
