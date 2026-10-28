const express = require('express');
const { getScoringConfigurations,updateScoringConfigurations } = require('../Controllers/scoring.controller');
    
// this is admin routes for scoring only admin can access this

const router = express.Router();

router.get('/getScoring', getScoringConfigurations);
router.patch('/updateScoring/:id', updateScoringConfigurations);

module.exports = router;