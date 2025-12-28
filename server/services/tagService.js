const { Tag, PostTag } = require('../models');
const { Op, fn, col } = require('sequelize');

const getTags = async ({ search, page, limit }) => {
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
    limit,
    offset,
    subQuery: false,
  });

  const total = await Tag.count({ where });

  return {
    tags,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

const createTag = async ({ name, description, color }) => {
  if (!name || !name.trim()) {
    throw new Error('Tag name is required');
  }

  const existing = await Tag.findOne({ where: { name } });
  if (existing) {
    const err = new Error('Tag already exists');
    err.status = 409;
    throw err;
  }

  return Tag.create({ name, description, color });
};

const updateTag = async (id, { name, description, color }) => {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    const err = new Error('Tag not found');
    err.status = 404;
    throw err;
  }

  if (name && name !== tag.name) {
    const exists = await Tag.findOne({ where: { name } });
    if (exists) {
      const err = new Error('Another tag with this name already exists');
      err.status = 409;
      throw err;
    }
  }

  await tag.update({
    name: name ?? tag.name,
    description: description ?? tag.description,
    color: color ?? tag.color,
  });

  return tag;
};

const deleteTag = async (id) => {
  const tag = await Tag.findByPk(id);
  if (!tag) {
    const err = new Error('Tag not found');
    err.status = 404;
    throw err;
  }

  await PostTag.destroy({ where: { tag_id: id } });
  await tag.destroy();
};

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};
