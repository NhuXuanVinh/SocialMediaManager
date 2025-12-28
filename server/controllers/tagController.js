const tagService = require('../services/tagService');

const getTags = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;

    const result = await tagService.getTags({
      search,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: result.tags,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('Get tags error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const createTag = async (req, res) => {
  try {
    const tag = await tagService.createTag(req.body);

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (err) {
    console.error('Create tag error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);

    res.json({
      success: true,
      data: tag,
    });
  } catch (err) {
    console.error('Update tag error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    await tagService.deleteTag(req.params.id);

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (err) {
    console.error('Delete tag error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};
