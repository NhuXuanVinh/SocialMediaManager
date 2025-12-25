const { Tag, PostTag } = require('../models');
const { Op, fn, col } = require('sequelize');

/**
 * GET tags
 * GET /api/tags?search=&page=&limit=
 */
const getTags = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? { name: { [Op.iLike]: `%${search}%` } }
      : {};

    const tags = await Tag.findAll({
      where,
      attributes: {
        include: [[fn('COUNT', col('PostTags.tag_id')), 'usageCount']],
      },
      include: [
        {
          model: PostTag,
          attributes: [],
        },
      ],
      group: ['Tag.tag_id'],
      order: [['name', 'ASC']],
      limit: Number(limit),
      offset: Number(offset),
      subQuery: false,
    });

    const total = await Tag.count({ where });

    res.json({
      success: true,
      data: tags,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error('Get tags error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * CREATE tag
 * POST /api/tags
 */
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required',
      });
    }

    const existing = await Tag.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tag already exists',
      });
    }

    const tag = await Tag.create({
      name,
      description,
      color,
    });

    return res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    console.error('Create tag error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create tag',
    });
  }
};

/**
 * UPDATE tag
 * PUT /api/tags/:id
 */
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    // Prevent duplicate name
    if (name && name !== tag.name) {
      const exists = await Tag.findOne({ where: { name } });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Another tag with this name already exists',
        });
      }
    }

    await tag.update({
      name: name ?? tag.name,
      description: description ?? tag.description,
      color: color ?? tag.color,
    });

    return res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    console.error('Update tag error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tag',
    });
  }
};

/**
 * DELETE tag
 * DELETE /api/tags/:id
 */
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    // Optional: clean up junction table
    await PostTag.destroy({ where: { tag_id: id } });

    await tag.destroy();

    return res.status(200).json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (err) {
    console.error('Delete tag error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
    });
  }
};

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};
