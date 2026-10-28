const { scoringconfiguration } = require('../models');

async function getScoringConfigurations(req, res) {
    try {
        const configurations = await scoringconfiguration.findAll({
            order: [['id', 'ASC']]
        });
        return res.status(200).json({
            data: configurations
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function updateScoringConfigurations(req, res) {
    try {
        const id = req.params.id;
        const { weight, is_active, description, name } = req.body;
        const configuration = await scoringconfiguration.findByPk(id);
        if (!configuration) {
            return res.status(404).json({
                message: 'Configuration not found'
            });
        }

        if (weight !== undefined) configuration.weight = weight;
        if (is_active !== undefined) configuration.is_active = is_active;
        if (description !== undefined) configuration.description = description;
        if (name !== undefined) configuration.name = name;

        await configuration.save();

        return res.status(200).json({
            message: 'Configuration updated successfully',
            data: configuration
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = { getScoringConfigurations, updateScoringConfigurations };
