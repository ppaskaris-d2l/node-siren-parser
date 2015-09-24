'use strict';

const assert = require('assert');

const
	Action = require('./Action'),
	Link = require('./Link');

function Entity (entity) {
	if ('object' !== typeof entity) {
		entity = JSON.parse(entity);
	}

	const self = this;

	assert('undefined' === typeof entity.rel || Array.isArray(entity.rel));
	assert('undefined' === typeof entity.title || 'string' === typeof entity.title);
	assert('undefined' === typeof entity.type || 'string' === typeof entity.type);
	assert('undefined' === typeof entity.properties || 'object' === typeof entity.properties);
	assert('undefined' === typeof entity.class || Array.isArray(entity.class));
	assert('undefined' === typeof entity.actions || Array.isArray(entity.actions));
	assert('undefined' === typeof entity.links || Array.isArray(entity.links));
	assert('undefined' === typeof entity.entities || Array.isArray(entity.entities));

	if (entity.rel) {
		// Only applies to sub-entities (required for them)
		self.rel = entity.rel;
	}

	if (entity.title) {
		self.title = entity.title;
	}

	if (entity.type) {
		self.type = entity.type;
	}

	if (entity.properties) {
		self.properties = entity.properties;
	}

	if (entity.class) {
		self.class = entity.class;
	}

	self.actionsByName = {};
	if (entity.actions) {
		self.actions = [];
		entity.actions.forEach(function (action) {
			self.actions.push(new Action(action));
			self.actionsByName[action.name] = action;
		});
	}

	self.linksByRel = {};
	if (entity.links) {
		self.links = [];
		entity.links.forEach(function (link) {
			self.links.push(new Link(link));

			link.rel.forEach(function (rel) {
				self.linksByRel[rel] = link;
			});
		});
	}

	self.entitiesByRel = {};
	if (entity.entities) {
		self.entities = [];
		entity.entities.forEach(function (subEntity) {
			assert(Array.isArray(subEntity.rel));

			if ('string' === typeof subEntity.href) {
				self.entities.push(new Link(subEntity));
			} else {
				self.entities.push(new Entity(subEntity));
			}

			subEntity.rel.forEach(function (rel) {
				if ('string' === typeof subEntity.href) {
					self.entitiesByRel[rel] = new Link(subEntity);
				} else {
					self.entitiesByRel[rel] = new Entity(subEntity);
				}
			});
		});
	}
}

Entity.prototype.getAction = function (actionName) {
	return this.actionsByName[actionName];
};

Entity.prototype.getLink = function (linkRel) {
	return this.linksByRel[linkRel];
};

Entity.prototype.getSubEntity = function (entityRel) {
	return this.entitiesByRel[entityRel];
};

module.exports = Entity;