const mysql = require('mysql');

class NodeManager {
  static instance;
  nodes = [];
  visitedNodes = new Set();

  static getInstance() {
    if (!NodeManager.instance) {
      NodeManager.instance = new NodeManager();
    }
    return NodeManager.instance;
  }

  connectDatabase() {
    return mysql.createConnection({
      host: 'localhost',
      user: 'trinity',
      password: 'trinity',
      database: 'world'
    });
  }

  loadNodes() {
    const connection = this.connectDatabase();
    connection.connect(err => {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + connection.threadId);
      //const query = `
      //          SELECT id, x, y, z, links
      //          FROM creature_template_npcbot_wander_nodes
      //          WHERE mapid = 0;
      //      `;
      const query = `
                SELECT id, mapid, x, y, z, links
                FROM creature_template_npcbot_wander_nodes;
            `;
      connection.query(query, (error, results, fields) => {
        if (error) {
          throw error;
        }
        this.nodes = results;
        console.log('Nodes loaded:', this.nodes.length);
        connection.end();
      });
    });
  }

  getClosestNode(position) {
    if (this.nodes.length === 0) {
      console.error("Nodes are not loaded yet.");
      return null;
    }
    return this.nodes.reduce((prev, curr) => {
      const prevDist = Math.sqrt(Math.pow(prev.x - position.x, 2) + Math.pow(prev.y - position.y, 2) + Math.pow(prev.z - position.z, 2));
      const currDist = Math.sqrt(Math.pow(curr.x - position.x, 2) + Math.pow(curr.y - position.y, 2) + Math.pow(curr.z - position.z, 2));
      return (prevDist < currDist) ? prev : curr;
    });
  }

  getRandomLinkedNodeOld(nodeId) {
    const node = this.nodes.find(n => n.id === parseInt(nodeId));
    if (!node || !node.links) {
      console.error("Node not found or no links available");
      return null;
    }
    const links = node.links.split(' ').map(link => link.split(':')[0]).filter(id => id);
    if (links.length === 0) {
      console.error("No valid links found");
      return null;
    }
    const randomLinkId = links[Math.floor(Math.random() * links.length)];
    const linkedNode = this.nodes.find(n => n.id === parseInt(randomLinkId));
    return linkedNode || null;
  }

  getRandomLinkedNode(nodeId) {
    const node = this.nodes.find(n => n.id === parseInt(nodeId));
    if (!node || !node.links) {
      console.error("Node not found or no links available");
      return null;
    }
    const links = node.links.split(' ').map(link => link.split(':')[0]).filter(id => id);
    if (links.length === 0) {
      console.error("No valid links found");
      return null;
    }

    // Filter links to get unvisited ones first
    const unvisitedLinks = links.filter(id => !this.visitedNodes.has(parseInt(id)));

    let selectedLink;
    if (unvisitedLinks.length > 0) {
      // Prefer unvisited nodes
      selectedLink = unvisitedLinks[Math.floor(Math.random() * unvisitedLinks.length)];
    } else {
      // If all are visited, pick any random link
      selectedLink = links[Math.floor(Math.random() * links.length)];
    }

    const linkedNode = this.nodes.find(n => n.id === parseInt(selectedLink));
    if (linkedNode) {
      this.visitedNodes.add(linkedNode.id); // Mark this node as visited
    }

    return linkedNode || null;
  }
}

module.exports.NodeManager = NodeManager;
