const GAME_WIDTH = 1000;
const GAME_HEIGHT = 700;
const BOARD_RIGHT = 735;
const SIDEBAR_X = 735;
const TOTAL_WAVES = 8;

const difficulties = [
  { name: 'Easy', startingGold: 260, startingLives: 20, enemyHealth: 0.75, enemySpeed: 0.9 },
  { name: 'Normal', startingGold: 220, startingLives: 15, enemyHealth: 1, enemySpeed: 1 },
  { name: 'Hard', startingGold: 185, startingLives: 12, enemyHealth: 1.35, enemySpeed: 1.12 }
];

const maps = [
  {
    name: 'Mossy Crossing',
    path: [[35, 175], [175, 175], [175, 325], [345, 325], [345, 160], [520, 160], [520, 465], [700, 465]]
  },
  {
    name: 'Sunken Ruins',
    path: [[35, 390], [145, 390], [145, 170], [315, 170], [315, 535], [475, 535], [475, 275], [700, 275]]
  },
  {
    name: 'Thornwood Trail',
    path: [[35, 535], [135, 535], [135, 410], [275, 410], [275, 535], [425, 535], [425, 155], [560, 155], [560, 350], [700, 350]]
  }
];

const towerTypes = [
  {
    name: 'Scout Tower',
    shortName: 'Scout',
    cost: 60,
    range: 135,
    fireDelay: 0.62,
    damage: 12,
    color: '#82d96d',
    description: 'Quick, reliable shots'
  },
  {
    name: 'Frost Tower',
    shortName: 'Frost',
    cost: 85,
    range: 118,
    fireDelay: 0.9,
    damage: 7,
    slowFactor: 0.55,
    slowDuration: 1.4,
    color: '#6ed8e8',
    description: 'Slows enemies down'
  },
  {
    name: 'Cannon Tower',
    shortName: 'Cannon',
    cost: 125,
    range: 155,
    fireDelay: 1.35,
    damage: 30,
    splashRadius: 48,
    color: '#f0a75d',
    description: 'Heavy splash damage'
  }
];

let screen = 'lobby';
let selectedDifficulty = 1;
let selectedMap = 0;
let selectedTowerType = -1;
let towerList = [];
let enemyList = [];
let projectileList = [];
let gold = 0;
let lives = 0;
let currentWave = 0;
let enemiesRemainingToSpawn = 0;
let spawnClock = 0;
let waveInProgress = false;
let paused = false;
let noticeText = '';
let noticeTimer = 0;

function setup() {
  new Canvas(GAME_WIDTH, GAME_HEIGHT);
  pixelDensity(1);
  textFont('system-ui');
  textAlign(LEFT, CENTER);
}

function draw() {
  if (screen === 'lobby') {
    drawLobby();
    return;
  }

  updateGame(Math.min(deltaTime / 1000, 0.05));
  drawGame();
}

function drawLobby() {
  background('#14251f');
  noStroke();
  for (let i = 0; i < 24; i++) {
    fill(i % 2 ? '#1a3028' : '#1d352c');
    circle((i * 173 + 61) % GAME_WIDTH, (i * 97 + 42) % GAME_HEIGHT, 3 + (i % 3) * 2);
  }

  textAlign(CENTER, CENTER);
  fill('#d7edb5');
  textSize(15);
  text('A FOREST TOWER DEFENSE GAME', GAME_WIDTH / 2, 42);
  fill('#f1f3db');
  textSize(38);
  textStyle(BOLD);
  text('FORTRESS OF THE FORGOTTEN GROVE', GAME_WIDTH / 2, 86);
  textStyle(NORMAL);
  fill('#bac9ae');
  textSize(16);
  text('Choose your challenge and defend the grove through eight waves.', GAME_WIDTH / 2, 124);

  fill('#d7edb5');
  textSize(18);
  textStyle(BOLD);
  text('SELECT DIFFICULTY', GAME_WIDTH / 2, 175);
  textStyle(NORMAL);

  const difficultyWidth = 190;
  const difficultyGap = 18;
  const difficultyStart = (GAME_WIDTH - (difficultyWidth * 3 + difficultyGap * 2)) / 2;
  difficulties.forEach((difficulty, index) => {
    const x = difficultyStart + index * (difficultyWidth + difficultyGap);
    drawCard(x, 198, difficultyWidth, 58, selectedDifficulty === index);
    fill(selectedDifficulty === index ? '#f1f3db' : '#c4d2bc');
    textSize(19);
    textStyle(BOLD);
    text(difficulty.name, x + difficultyWidth / 2, 222);
    textStyle(NORMAL);
    fill('#a9b9a2');
    textSize(12);
    const detail = index === 0 ? 'More lives · easier enemies' : index === 1 ? 'A balanced defense' : 'Fewer lives · tougher enemies';
    text(detail, x + difficultyWidth / 2, 242);
  });

  fill('#d7edb5');
  textSize(18);
  textStyle(BOLD);
  text('CHOOSE A MAP', GAME_WIDTH / 2, 294);
  textStyle(NORMAL);
  const mapWidth = 250;
  const mapGap = 22;
  const mapStart = (GAME_WIDTH - (mapWidth * 3 + mapGap * 2)) / 2;
  maps.forEach((map, index) => {
    const x = mapStart + index * (mapWidth + mapGap);
    drawMapCard(x, 318, mapWidth, 200, index);
  });

  drawButton(365, 574, 270, 62, 'ENTER THE GROVE', true);
  fill('#a9b9a2');
  textSize(13);
  text('Build towers away from the road, then start each wave when you are ready.', GAME_WIDTH / 2, 660);
  textAlign(LEFT, CENTER);
}

function drawMapCard(x, y, cardWidth, cardHeight, mapIndex) {
  const selected = selectedMap === mapIndex;
  drawCard(x, y, cardWidth, cardHeight, selected);

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.roundRect(x + 1, y + 1, cardWidth - 2, cardHeight - 2, 10);
  drawingContext.clip();
  noStroke();
  fill(mapIndex === 0 ? '#29493a' : mapIndex === 1 ? '#34423a' : '#283f36');
  rect(x + 3, y + 3, cardWidth - 6, cardHeight - 6);
  for (let i = 0; i < 12; i++) {
    fill(i % 2 ? '#426047' : '#3a5741');
    circle(x + 14 + (i * 71) % (cardWidth - 25), y + 18 + (i * 43) % 95, 4 + i % 4);
  }

  const mapPath = maps[mapIndex].path;
  noFill();
  stroke('#8d7958');
  strokeWeight(15);
  beginShape();
  mapPath.forEach(point => vertex(x + 10 + point[0] * 0.31, y - 10 + point[1] * 0.25));
  endShape();
  stroke('#c8b785');
  strokeWeight(3);
  beginShape();
  mapPath.forEach(point => vertex(x + 10 + point[0] * 0.31, y - 10 + point[1] * 0.25));
  endShape();
  drawingContext.restore();
  pop();

  fill(selected ? '#f1f3db' : '#d4dfca');
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text(maps[mapIndex].name, x + cardWidth / 2, y + cardHeight - 24);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
}

function drawCard(x, y, cardWidth, cardHeight, selected) {
  stroke(selected ? '#c1e886' : '#4a6654');
  strokeWeight(selected ? 2 : 1);
  fill(selected ? '#314b37' : '#20352d');
  rect(x, y, cardWidth, cardHeight, 9);
}

function drawButton(x, y, buttonWidth, buttonHeight, label, active) {
  noStroke();
  fill(active ? '#a6d86e' : '#435448');
  rect(x, y, buttonWidth, buttonHeight, 10);
  fill(active ? '#19251b' : '#b5c2b0');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(label, x + buttonWidth / 2, y + buttonHeight / 2);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
}

function drawGame() {
  background('#192a20');
  drawTopBar();
  drawBattlefield();
  drawSidebar();

  if (noticeTimer > 0) {
    fill('#142019ee');
    noStroke();
    rect(190, 88, 355, 38, 8);
    fill('#f3e7ad');
    textAlign(CENTER, CENTER);
    textSize(14);
    text(noticeText, 367, 107);
    textAlign(LEFT, CENTER);
  }

  if (screen === 'won' || screen === 'lost') {
    drawResultOverlay();
  } else if (paused) {
    drawPauseOverlay();
  }
}

function drawTopBar() {
  noStroke();
  fill('#101b16');
  rect(0, 0, GAME_WIDTH, 78);

  fill('#d7edb5');
  textSize(20);
  textStyle(BOLD);
  text('FORGOTTEN GROVE', 22, 25);
  textStyle(NORMAL);
  fill('#aebda8');
  textSize(13);
  text(`${maps[selectedMap].name}  ·  ${difficulties[selectedDifficulty].name}`, 22, 52);

  drawTopStat('GOLD', `$${gold}`, 390, '#f4d276');
  drawTopStat('LIVES', `${lives}`, 555, '#ed8b76');
  drawTopStat('WAVE', currentWave ? `${currentWave} / ${TOTAL_WAVES}` : `Ready / ${TOTAL_WAVES}`, 715, '#9fd489');
}

function drawTopStat(label, value, x, color) {
  fill('#829385');
  textSize(11);
  textStyle(BOLD);
  text(label, x, 24);
  textStyle(NORMAL);
  fill(color);
  textSize(19);
  textStyle(BOLD);
  text(value, x, 49);
  textStyle(NORMAL);
}

function drawBattlefield() {
  noStroke();
  fill('#243b2b');
  rect(0, 78, BOARD_RIGHT, GAME_HEIGHT - 78);
  for (let x = 20; x < BOARD_RIGHT; x += 42) {
    for (let y = 95; y < GAME_HEIGHT; y += 42) {
      fill(((x + y) / 42) % 2 ? '#29412f' : '#263e2e');
      circle(x + 4, y + 5, 2);
    }
  }

  drawPath();
  towerList.forEach(drawTower);
  enemyList.forEach(drawEnemy);
  projectileList.forEach(drawProjectile);

  if (selectedTowerType >= 0 && mouseX < BOARD_RIGHT && mouseY > 78 && mouseY < GAME_HEIGHT) {
    const type = towerTypes[selectedTowerType];
    const legal = canPlaceTower(mouseX, mouseY, type);
    noStroke();
    fill(legal ? '#9ed47c30' : '#e36c5b35');
    circle(mouseX, mouseY, type.range * 2);
    fill(legal ? '#a6d86e' : '#ec806e');
    circle(mouseX, mouseY, 34);
    stroke('#eff5dc');
    strokeWeight(2);
    noFill();
    circle(mouseX, mouseY, 34);
  }
}

function drawPath() {
  const mapPath = maps[selectedMap].path;
  noFill();
  stroke('#162219');
  strokeWeight(38);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  beginShape();
  mapPath.forEach(point => vertex(point[0], point[1]));
  endShape();

  stroke('#927b50');
  strokeWeight(31);
  beginShape();
  mapPath.forEach(point => vertex(point[0], point[1]));
  endShape();
  stroke('#b59b68');
  strokeWeight(3);
  drawingContext.setLineDash([9, 12]);
  beginShape();
  mapPath.forEach(point => vertex(point[0], point[1]));
  endShape();
  drawingContext.setLineDash([]);

  noStroke();
  fill('#83d477');
  circle(mapPath[0][0], mapPath[0][1], 23);
  fill('#e5b469');
  circle(mapPath[mapPath.length - 1][0], mapPath[mapPath.length - 1][1], 28);
  fill('#17231a');
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);
  text('IN', mapPath[0][0], mapPath[0][1]);
  text('!', mapPath[mapPath.length - 1][0], mapPath[mapPath.length - 1][1]);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
}

function drawTower(tower) {
  const type = towerTypes[tower.typeIndex];
  if (selectedTowerType === tower.typeIndex && mouseIsPressed === false && towerList[towerList.length - 1] === tower) {
    noFill();
    stroke('#b5db8a50');
    strokeWeight(1);
    circle(tower.x, tower.y, type.range * 2);
  }
  noStroke();
  fill('#132019');
  circle(tower.x + 2, tower.y + 3, 34);
  fill('#314c36');
  circle(tower.x, tower.y, 31);
  fill(type.color);
  circle(tower.x, tower.y, 18);
  fill('#152018');
  circle(tower.x, tower.y, 6);
  stroke('#d8e6c6');
  strokeWeight(2);
  line(tower.x, tower.y, tower.x + 12, tower.y - 7);
}

function drawEnemy(enemy) {
  noStroke();
  fill('#172019');
  circle(enemy.x + 2, enemy.y + 3, enemy.radius * 2);
  fill(enemy.kind === 'brute' ? '#b37650' : enemy.kind === 'runner' ? '#d6a64e' : '#d06f67');
  circle(enemy.x, enemy.y, enemy.radius * 2);
  fill('#412c28');
  circle(enemy.x - 3, enemy.y - 2, 3);
  circle(enemy.x + 3, enemy.y - 2, 3);

  const barWidth = enemy.radius * 2.3;
  fill('#312b25');
  rect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, 4, 2);
  fill('#95d27c');
  rect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth * Math.max(0, enemy.health / enemy.maxHealth), 4, 2);
  if (enemy.slowTimer > 0) {
    noFill();
    stroke('#8feaff');
    strokeWeight(2);
    circle(enemy.x, enemy.y, enemy.radius * 2 + 5);
  }
}

function drawProjectile(projectile) {
  noStroke();
  fill(projectile.color);
  circle(projectile.x, projectile.y, projectile.splashRadius ? 10 : 7);
}

function drawSidebar() {
  noStroke();
  fill('#142019');
  rect(SIDEBAR_X, 78, GAME_WIDTH - SIDEBAR_X, GAME_HEIGHT - 78);
  stroke('#415744');
  line(SIDEBAR_X, 78, SIDEBAR_X, GAME_HEIGHT);
  noStroke();

  fill('#e0ebd4');
  textSize(18);
  textStyle(BOLD);
  text('DEFENSES', 758, 108);
  textStyle(NORMAL);
  fill('#aab9a5');
  textSize(12);
  text('Choose a tower, then click grass.', 758, 132);

  towerTypes.forEach((type, index) => {
    const y = 154 + index * 91;
    const selected = selectedTowerType === index;
    stroke(selected ? '#aedb7b' : '#425743');
    strokeWeight(selected ? 2 : 1);
    fill(selected ? '#2b4431' : '#203129');
    rect(755, y, 225, 77, 8);
    noStroke();
    fill(type.color);
    circle(778, y + 25, 16);
    fill('#dce7cf');
    textSize(14);
    textStyle(BOLD);
    text(type.shortName, 794, y + 22);
    textStyle(NORMAL);
    fill('#a8b8a2');
    textSize(11);
    text(type.description, 770, y + 48);
    fill(gold >= type.cost ? '#f4d276' : '#d98777');
    textAlign(RIGHT, CENTER);
    textSize(13);
    text(`$${type.cost}`, 963, y + 23);
    textAlign(LEFT, CENTER);
  });

  const canStart = !waveInProgress && currentWave < TOTAL_WAVES && !paused;
  drawSidebarButton(755, 443, 225, 48, currentWave === 0 ? 'START WAVE 1' : `START WAVE ${currentWave + 1}`, canStart);
  drawSidebarButton(755, 501, 225, 42, paused ? 'RESUME' : 'PAUSE', screen !== 'won' && screen !== 'lost');

  fill('#e0ebd4');
  textSize(13);
  textStyle(BOLD);
  text('HOW TO PLAY', 758, 568);
  textStyle(NORMAL);
  fill('#aab9a5');
  textSize(11);
  text('1. Buy a tower above.', 758, 592);
  text('2. Place it beside the road.', 758, 611);
  text('3. Start a wave when ready.', 758, 630);
  text('Leaked enemies cost one life.', 758, 659);

  if (noticeTimer > 0) noticeTimer -= deltaTime / 1000;
}

function drawSidebarButton(x, y, buttonWidth, buttonHeight, label, active) {
  noStroke();
  fill(active ? '#91bf66' : '#465449');
  rect(x, y, buttonWidth, buttonHeight, 8);
  fill(active ? '#182319' : '#a9b5a4');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  text(label, x + buttonWidth / 2, y + buttonHeight / 2);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
}

function drawPauseOverlay() {
  noStroke();
  fill('#101a16bb');
  rect(0, 78, BOARD_RIGHT, GAME_HEIGHT - 78);
  fill('#f1f3db');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text('PAUSED', BOARD_RIGHT / 2, 330);
  textStyle(NORMAL);
  fill('#d0dcc7');
  textSize(15);
  text('Click Resume to continue defending.', BOARD_RIGHT / 2, 368);
  textAlign(LEFT, CENTER);
}

function drawResultOverlay() {
  noStroke();
  fill('#101a16cc');
  rect(0, 78, GAME_WIDTH, GAME_HEIGHT - 78);
  fill(screen === 'won' ? '#b8e889' : '#f0947d');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(38);
  text(screen === 'won' ? 'THE GROVE IS SAFE!' : 'THE GROVE HAS FALLEN', GAME_WIDTH / 2, 294);
  fill('#e0e9d8');
  textStyle(NORMAL);
  textSize(17);
  text(screen === 'won' ? 'You survived every wave. The forest thanks you.' : `You reached wave ${currentWave} of ${TOTAL_WAVES}. Try another strategy!`, GAME_WIDTH / 2, 340);
  drawButton(350, 390, 300, 58, 'PLAY AGAIN', true);
  fill('#aebda8');
  textSize(13);
  text('Click to return to the lobby.', GAME_WIDTH / 2, 470);
  textAlign(LEFT, CENTER);
}

function updateGame(step) {
  if (noticeTimer > 0) noticeTimer = Math.max(0, noticeTimer - step);
  if (paused || screen === 'won' || screen === 'lost') return;

  if (waveInProgress && enemiesRemainingToSpawn > 0) {
    spawnClock -= step;
    if (spawnClock <= 0) {
      spawnEnemy();
      enemiesRemainingToSpawn--;
      spawnClock = Math.max(0.42, 0.92 - currentWave * 0.035);
    }
  }

  const routeLength = getRouteLength(maps[selectedMap].path);
  enemyList.forEach(enemy => {
    const speedFactor = enemy.slowTimer > 0 ? enemy.slowFactor : 1;
    enemy.pathProgress += enemy.speed * speedFactor * step;
    enemy.slowTimer = Math.max(0, enemy.slowTimer - step);
    const position = getPositionOnRoute(maps[selectedMap].path, routeLength, enemy.pathProgress);
    enemy.x = position.x;
    enemy.y = position.y;
    if (enemy.pathProgress >= routeLength) {
      enemy.leaked = true;
      lives--;
    }
  });
  enemyList = enemyList.filter(enemy => !enemy.dead && !enemy.leaked);

  towerList.forEach(tower => {
    tower.cooldown = Math.max(0, tower.cooldown - step);
    if (tower.cooldown > 0) return;
    const type = towerTypes[tower.typeIndex];
    const target = enemyList
      .filter(enemy => distance(tower.x, tower.y, enemy.x, enemy.y) <= type.range)
      .sort((first, second) => second.pathProgress - first.pathProgress)[0];
    if (!target) return;
    projectileList.push({
      x: tower.x,
      y: tower.y,
      target,
      speed: type.shortName === 'Cannon' ? 350 : 470,
      damage: type.damage,
      color: type.color,
      splashRadius: type.splashRadius || 0,
      slowFactor: type.slowFactor || 1,
      slowDuration: type.slowDuration || 0
    });
    tower.cooldown = type.fireDelay;
  });

  projectileList.forEach(projectile => {
    if (!projectile.target || projectile.target.dead || projectile.target.leaked) {
      projectile.target = null;
      return;
    }
    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - projectile.y;
    const remaining = Math.hypot(dx, dy);
    const movement = projectile.speed * step;
    if (remaining <= movement) {
      const impactX = projectile.target.x;
      const impactY = projectile.target.y;
      const targets = projectile.splashRadius
        ? enemyList.filter(enemy => distance(impactX, impactY, enemy.x, enemy.y) <= projectile.splashRadius)
        : [projectile.target];
      targets.forEach(enemy => {
        enemy.health -= projectile.damage;
        if (projectile.slowDuration > 0) {
          enemy.slowTimer = Math.max(enemy.slowTimer, projectile.slowDuration);
          enemy.slowFactor = projectile.slowFactor;
        }
        if (enemy.health <= 0 && !enemy.dead) {
          enemy.dead = true;
          gold += enemy.reward;
        }
      });
      projectile.target = null;
    } else {
      projectile.x += dx / remaining * movement;
      projectile.y += dy / remaining * movement;
    }
  });
  projectileList = projectileList.filter(projectile => projectile.target);
  enemyList = enemyList.filter(enemy => !enemy.dead);

  if (lives <= 0) {
    lives = 0;
    screen = 'lost';
    return;
  }

  if (waveInProgress && enemiesRemainingToSpawn === 0 && enemyList.length === 0) {
    waveInProgress = false;
    if (currentWave >= TOTAL_WAVES) {
      screen = 'won';
    } else {
      const bonus = 35 + currentWave * 8;
      gold += bonus;
      showNotice(`Wave cleared! +$${bonus} supply bonus.`);
    }
  }
}

function spawnEnemy() {
  const spawnNumber = currentWave * 100 + (7 + currentWave * 2 - enemiesRemainingToSpawn);
  const kind = spawnNumber % 7 === 0 ? 'brute' : spawnNumber % 4 === 0 ? 'runner' : 'scout';
  const difficulty = difficulties[selectedDifficulty];
  let health = (22 + currentWave * 8) * difficulty.enemyHealth;
  let speed = (48 + currentWave * 2.4) * difficulty.enemySpeed;
  let radius = 11;
  let reward = 9 + Math.floor(currentWave * 0.7);

  if (kind === 'brute') {
    health *= 2.4;
    speed *= 0.68;
    radius = 15;
    reward += 8;
  } else if (kind === 'runner') {
    health *= 0.7;
    speed *= 1.45;
    radius = 9;
    reward += 2;
  }

  enemyList.push({
    x: maps[selectedMap].path[0][0],
    y: maps[selectedMap].path[0][1],
    pathProgress: 0,
    health,
    maxHealth: health,
    speed,
    radius,
    reward,
    kind,
    slowTimer: 0,
    slowFactor: 1,
    dead: false,
    leaked: false
  });
}

function startNewGame() {
  const difficulty = difficulties[selectedDifficulty];
  screen = 'playing';
  towerList = [];
  enemyList = [];
  projectileList = [];
  gold = difficulty.startingGold;
  lives = difficulty.startingLives;
  currentWave = 0;
  enemiesRemainingToSpawn = 0;
  waveInProgress = false;
  paused = false;
  selectedTowerType = -1;
  showNotice('Place towers anywhere on the grass beside the road.');
}

function startWave() {
  if (screen !== 'playing' || paused || waveInProgress || currentWave >= TOTAL_WAVES) return;
  currentWave++;
  enemiesRemainingToSpawn = 7 + currentWave * 2;
  spawnClock = 0.3;
  waveInProgress = true;
  showNotice(`Wave ${currentWave} incoming!`);
}

function canPlaceTower(x, y, type) {
  if (x < 28 || x > BOARD_RIGHT - 25 || y < 100 || y > GAME_HEIGHT - 22 || gold < type.cost) return false;
  if (distanceToRoute(x, y, maps[selectedMap].path) < 48) return false;
  return towerList.every(tower => distance(x, y, tower.x, tower.y) >= 38);
}

function placeTower(x, y) {
  if (selectedTowerType < 0) {
    showNotice('Choose a tower from the defense panel first.');
    return;
  }
  const type = towerTypes[selectedTowerType];
  if (gold < type.cost) {
    showNotice(`Not enough gold for a ${type.shortName} tower.`);
    return;
  }
  if (distanceToRoute(x, y, maps[selectedMap].path) < 48) {
    showNotice('Keep towers at least a little way off the road.');
    return;
  }
  if (towerList.some(tower => distance(x, y, tower.x, tower.y) < 38)) {
    showNotice('Leave some space between towers.');
    return;
  }
  if (x < 28 || x > BOARD_RIGHT - 25 || y < 100 || y > GAME_HEIGHT - 22) return;

  gold -= type.cost;
  towerList.push({ x, y, typeIndex: selectedTowerType, cooldown: 0 });
  showNotice(`${type.shortName} tower built.`);
}

function mousePressed() {
  if (screen === 'lobby') {
    handleLobbyClick(mouseX, mouseY);
    return false;
  }
  if (screen === 'won' || screen === 'lost') {
    if (mouseY >= 390 && mouseY <= 448) {
      screen = 'lobby';
      paused = false;
    }
    return false;
  }
  if (mouseX >= SIDEBAR_X) {
    handleSidebarClick(mouseX, mouseY);
    return false;
  }
  if (paused) return false;
  if (mouseX >= 0 && mouseX < BOARD_RIGHT && mouseY > 78 && mouseY < GAME_HEIGHT) {
    placeTower(mouseX, mouseY);
  }
  return false;
}

function handleLobbyClick(x, y) {
  const difficultyWidth = 190;
  const difficultyGap = 18;
  const difficultyStart = (GAME_WIDTH - (difficultyWidth * 3 + difficultyGap * 2)) / 2;
  for (let index = 0; index < difficulties.length; index++) {
    const buttonX = difficultyStart + index * (difficultyWidth + difficultyGap);
    if (insideRect(x, y, buttonX, 198, difficultyWidth, 58)) {
      selectedDifficulty = index;
      return;
    }
  }

  const mapWidth = 250;
  const mapGap = 22;
  const mapStart = (GAME_WIDTH - (mapWidth * 3 + mapGap * 2)) / 2;
  for (let index = 0; index < maps.length; index++) {
    const cardX = mapStart + index * (mapWidth + mapGap);
    if (insideRect(x, y, cardX, 318, mapWidth, 200)) {
      selectedMap = index;
      return;
    }
  }

  if (insideRect(x, y, 365, 574, 270, 62)) startNewGame();
}

function handleSidebarClick(x, y) {
  for (let index = 0; index < towerTypes.length; index++) {
    if (insideRect(x, y, 755, 154 + index * 91, 225, 77)) {
      selectedTowerType = selectedTowerType === index ? -1 : index;
      return;
    }
  }
  if (insideRect(x, y, 755, 443, 225, 48)) {
    if (!waveInProgress && currentWave < TOTAL_WAVES) startWave();
    return;
  }
  if (insideRect(x, y, 755, 501, 225, 42) && screen === 'playing') {
    paused = !paused;
  }
}

function getRouteLength(path) {
  let total = 0;
  for (let index = 1; index < path.length; index++) {
    total += distance(path[index - 1][0], path[index - 1][1], path[index][0], path[index][1]);
  }
  return total;
}

function getPositionOnRoute(path, totalLength, progress) {
  let remaining = Math.min(progress, totalLength);
  for (let index = 1; index < path.length; index++) {
    const start = path[index - 1];
    const end = path[index];
    const segmentLength = distance(start[0], start[1], end[0], end[1]);
    if (remaining <= segmentLength) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      return { x: lerp(start[0], end[0], ratio), y: lerp(start[1], end[1], ratio) };
    }
    remaining -= segmentLength;
  }
  const last = path[path.length - 1];
  return { x: last[0], y: last[1] };
}

function distanceToRoute(x, y, path) {
  let nearest = Infinity;
  for (let index = 1; index < path.length; index++) {
    const start = path[index - 1];
    const end = path[index];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const lengthSquared = dx * dx + dy * dy;
    const projection = lengthSquared === 0
      ? 0
      : constrain(((x - start[0]) * dx + (y - start[1]) * dy) / lengthSquared, 0, 1);
    const nearestX = start[0] + projection * dx;
    const nearestY = start[1] + projection * dy;
    nearest = Math.min(nearest, distance(x, y, nearestX, nearestY));
  }
  return nearest;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function insideRect(x, y, rectX, rectY, rectWidth, rectHeight) {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
}

function showNotice(message) {
  noticeText = message;
  noticeTimer = 2.4;
}
