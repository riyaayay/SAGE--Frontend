'use strict';

const AGENTS = [
  {
    id:0, num:'AGENT 01', name:'ARCHITECT', role:'SYSTEM DESIGN',
    desc:'Decomposes requirements into dependency graphs. Plans every subsystem before the first keystroke. Owns the interface contract.',
    gender:'male', suitColor:0x0a1e3d, hairColor:0x0e0a06, skinColor:0xd4a87a,
    beaconColor:0x4f8ef0, angle:0
  },
  {
    id:1, num:'AGENT 02', name:'IMPLEMENTER', role:'CODE GENERATION',
    desc:'Parallel synthesis across modules with zero context drift. Generates idiomatic, test-ready code from the Architect\'s blueprint.',
    gender:'male', suitColor:0x2a0f0f, hairColor:0x090706, skinColor:0xc89060,
    beaconColor:0xe05555, angle:90
  },
  {
    id:2, num:'AGENT 03', name:'SYNTHESIZER', role:'INTEGRATION ENGINE',
    desc:'Merges parallel agent outputs into coherent, tested, deployment-ready artifacts. Resolves conflicts via Nash Equilibrium arbitration.',
    gender:'male', suitColor:0x0a2010, hairColor:0x0a0805, skinColor:0xb8845a,
    beaconColor:0x3dcc7a, angle:180
  },
  {
    id:3, num:'AGENT 04', name:'RED-TEAM', role:'ADVERSARIAL PROBE',
    desc:'Attacks the Synthesizer\'s output systematically. Surfaces edge cases, security flaws, and logic errors before they reach production.',
    gender:'female', suitColor:0x28103d, hairColor:0x050305, skinColor:0xf0c8a0,
    beaconColor:0xd080f0, angle:270
  },
];

const CHAR_R = 2.85;
const TABLE_R = 2.2;

const KF = [
  {t:0,   pos:[1.5,9.5,3.5], look:[0,0.8,0],   ag:-1},
  {t:3.5, pos:[0,5.5,8],     look:[0,1.2,0],   ag:-1},
  {t:7,   pos:[0.4,3.0,6.2], look:[0,1.55,CHAR_R],   ag:0},
  {t:14,  pos:[6.2,3.0,0.4], look:[CHAR_R,1.55,0],   ag:1},
  {t:21,  pos:[0.4,3.0,-6.2],look:[0,1.55,-CHAR_R],  ag:2},
  {t:28,  pos:[-6.2,3.0,0.4],look:[-CHAR_R,1.55,0],  ag:3},
  {t:35,  pos:[3.5,6,5.5],   look:[0,1,0],     ag:-1},
  {t:40,  pos:[1.5,9.5,3.5], look:[0,0.8,0],   ag:-1},
];

const LOOP = 40;
