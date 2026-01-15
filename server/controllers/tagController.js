const tagService = require('../services/tagService');

const getTags = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace.id;

    const result = await tagService.getTags({
      workspaceId,
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
    const workspaceId = req.workspace.id;
    const tag = await tagService.createTag({
      workspaceId,
      ...req.body,
    });

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
    const workspaceId = req.workspace.id;
    const tag = await tagService.updateTag(
      workspaceId,
      req.params.id,
      req.body
    );

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
    const workspaceId = req.workspace.id;
    await tagService.deleteTag(workspaceId, req.params.id);

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
