
// --- Configuration ---
// Add extension: https://github.com/jwunderl/pxt-status-bar (Status Bar)
let worldSize = 10
let roomWidth = 20
let roomHeight = 15
// BOSS test: true = boss room is first adjacent room to start (R,L,D,U)
let BOSS_TEST_ADJACENT = false

// Custom kinds: enemies, goal, bullets, cosmetic sword (Ghost ? blade overlaps are manual)
let KindEnemy = SpriteKind.create()
let KindGoal = SpriteKind.create()
let KindBullet = SpriteKind.create()
let KindBladeVis = SpriteKind.create()
let KindDashFx = SpriteKind.create()
let KindHeal = SpriteKind.create()
let KindHealFx = SpriteKind.create()
let KindHitFx = SpriteKind.create()
let KindAlert = SpriteKind.create()

// Enemy data keys: "type" 0=?? 1=??(3HP?) 2=??(????), "hp", "cd", "lastSwing"
let EnemyTypeNormal = 0
let EnemyTypeTank = 1
let EnemyTypeTurret = 2
let EnemyTypeBoss = 3
let BossVariantBerserker = 0
let BossVariantArtillery = 1
let BossVariantBulwark = 2
let BOSS_HP_BERSERKER = 100
let BOSS_HP_ARTILLERY = 100
let BOSS_HP_BULWARK = 100
let BOSS_SLASH_WINDUP_FRAMES = 6
let BossSkillBerserkerShockwave = 1
let BossSkillBerserkerDashSlash = 2
let BossSkillBerserkerJumpSmash = 3
let BossSkillBerserkerBigTwirl = 10
let BossSkillArtilleryBackdash = 11
let BossSkillArtilleryUzi = 12
let BossSkillArtilleryRain = 13
let BossSkillArtilleryBigLaser = 20
let BossSkillBulwarkRampage = 21
let BossSkillBulwarkBoomerang = 22
let BossSkillBulwarkSoundwave = 23
let BossSkillBulwarkBigBump = 30
let BOSS_BIG_BERSERKER_FRAMES = 300
let BOSS_BIG_ARTILLERY_FRAMES = 600
let BOSS_BIG_BULWARK_FRAMES = 300
let BOSS_BIG_ARTILLERY_ALERT_FRAMES = 90
let BOSS_SKILL_GAP_FRAMES = 90
let BOSS_ROOM_CENTER_COL = 10
let BOSS_ROOM_CENTER_ROW = 7

let SWORD_DAMAGE = 1
let COUNTER_DAMAGE_TENTHS = 2
let swingSerial = 0
let PLAYER_SLASH_ALONG = 18
let PLAYER_SLASH_WIDE = 16
let PLAYER_SLASH_MIN = 0
let NORMAL_HP = 2
let TANK_HP = 5
let SHOOTER_HP = 2
let SHOOTER_FIRE_FRAMES = 180
let SHOOTER_WANDER_FRAMES = 40
let DASH_RECHARGE_FRAMES = 30
let DASH_STEPS = 10
let DASH_STEP_DIST = 7
let PLAYER_MAX_LIFE = 10
let HEAL_DROP_PERCENT = 30
let HEAL_PICKUP_AMOUNT = 2
let DASH_MAX_CHARGES = 2
let HIT_TIME_STOP_FRAMES = 22
let ROOM_ENTER_GRACE_FRAMES = 90
let SHOOTER_ATTACK_RADIUS = 95
let ENEMY_SLASH_WINDUP_FRAMES = 60
let COUNTER_HOLD_FRAMES = 12
let ENEMY_STUN_FRAMES = 180
let COUNTER_SCALE = 4
let REFLECTED_BULLET_DAMAGE = 2
let STUN_CAMERA_SHAKE = 14
let STUN_CAMERA_SHAKE_MS = 420
let REFLECT_HIT_CAMERA_SHAKE = 10
let REFLECT_HIT_CAMERA_SHAKE_MS = 220
let ENEMY_HIT_KNOCKBACK = 9
let ENEMY_HIT_KB_VEL = 38
let ENEMY_HIT_FLASH_FRAMES = 14
let DASH_HIT_RADIUS = 22

let RoomTypeStart = 0
let RoomTypeCombat = 1
let RoomTypeShop = 3
let RoomTypeSkill = 4
let RoomTypeHeal = 5
let RoomTypeMiniBoss = 6
let RoomTypeBoss = 7

let PlayerSkillFlyingSlash = 1
let PlayerSkillJumpSmash = 2
let SKILL_BAR_SLOTS = 5
let SKILL_DOUBLE_TAP_FRAMES = 28
let SKILL_COOLDOWN_FRAMES = 300
let MINI_BOSS_HP = 8

// Facing: 0=右, 1=下, 2=左, 3=上
let DirRight = 0
let DirDown = 1
let DirLeft = 2
let DirUp = 3

// spriteDataOf returns a per-sprite key/value store (hp, type, cd). Uses .data on the sprite instance so the arcade-sprite-data extension is not required.
function spriteDataOf(s: Sprite): { [key: string]: number } {
    let anyS = s as any
    if (!anyS.data) {
        anyS.data = {}
    }
    return anyS.data as { [key: string]: number }
}

// spriteReadNum reads a numeric field from sprite.data with a default when missing.
function spriteReadNum(s: Sprite, key: string, defaultVal: number): number {
    let v = spriteDataOf(s)[key]
    if (v == undefined || v == null) {
        return defaultVal
    }
    return v
}

// spriteWriteNum writes a numeric field onto sprite.data.
function spriteWriteNum(s: Sprite, key: string, val: number) {
    spriteDataOf(s)[key] = val
}

// combatGrid: 0 = safe room (start), 1 = combat (not cleared), 2 = combat cleared (white interior)
let startX = 5
let startY = 5
let roomX = startX
let roomY = startY

let worldGrid: number[][] = []
let combatGrid: number[][] = []
let roomTypeGrid: number[][] = []
for (let i = 0; i < worldSize; i++) {
    let row: number[] = []
    let cRow: number[] = []
    let tRow: number[] = []
    for (let j = 0; j < worldSize; j++) {
        row.push(0)
        cRow.push(0)
        tRow.push(0)
    }
    worldGrid.push(row)
    combatGrid.push(cRow)
    roomTypeGrid.push(tRow)
}

let currentGenX = startX
let currentGenY = startY
worldGrid[startY][startX] = 1

for (let i = 0; i < 40; i++) {
    let dir = randint(0, 3)
    if (dir == 0 && currentGenY > 0) currentGenY--
    else if (dir == 1 && currentGenY < worldSize - 1) currentGenY++
    else if (dir == 2 && currentGenX > 0) currentGenX--
    else if (dir == 3 && currentGenX < worldSize - 1) currentGenX++

    worldGrid[currentGenY][currentGenX] = 1
}

// assignRoomTypes picks shop / skill / heal / mini-boss / combat per cell (after end room is known).
function assignRoomTypes() {
    for (let y = 0; y < worldSize; y++) {
        for (let x = 0; x < worldSize; x++) {
            if (worldGrid[y][x] != 1) {
                continue
            }
            if (x == startX && y == startY) {
                roomTypeGrid[y][x] = RoomTypeStart
                combatGrid[y][x] = 0
                continue
            }
            if (x == endRoomX && y == endRoomY) {
                roomTypeGrid[y][x] = RoomTypeBoss
                combatGrid[y][x] = 1
                continue
            }
            let roll = randint(0, 99)
            if (roll < 40) {
                roomTypeGrid[y][x] = RoomTypeCombat
                combatGrid[y][x] = 1
            } else if (roll < 52) {
                roomTypeGrid[y][x] = RoomTypeShop
                combatGrid[y][x] = 0
            } else if (roll < 64) {
                roomTypeGrid[y][x] = RoomTypeSkill
                combatGrid[y][x] = 0
            } else if (roll < 76) {
                roomTypeGrid[y][x] = RoomTypeHeal
                combatGrid[y][x] = 0
            } else if (roll < 84) {
                roomTypeGrid[y][x] = RoomTypeMiniBoss
                combatGrid[y][x] = 1
            } else {
                roomTypeGrid[y][x] = RoomTypeCombat
                combatGrid[y][x] = 1
            }
        }
    }
}

// ?????????????????????????????????????
let endRoomX = startX
let endRoomY = startY
let endBest = -1
for (let y = 0; y < worldSize; y++) {
    for (let x = 0; x < worldSize; x++) {
        if (worldGrid[y][x] == 1 && !(x == startX && y == startY)) {
            let d = Math.abs(x - startX) + Math.abs(y - startY)
            if (d > endBest) {
                endBest = d
                endRoomX = x
                endRoomY = y
            }
        }
    }
}
if (endBest < 0) {
    let foundEnd = false
    for (let y = 0; y < worldSize && !foundEnd; y++) {
        for (let x = 0; x < worldSize; x++) {
            if (worldGrid[y][x] == 1 && (x != startX || y != startY)) {
                endRoomX = x
                endRoomY = y
                foundEnd = true
                break
            }
        }
    }
}
if (BOSS_TEST_ADJACENT) {
    let neighbors = [
        { x: startX + 1, y: startY },
        { x: startX - 1, y: startY },
        { x: startX, y: startY + 1 },
        { x: startX, y: startY - 1 }
    ]
    for (let i = 0; i < neighbors.length; i++) {
        let nx = neighbors[i].x
        let ny = neighbors[i].y
        if (nx >= 0 && nx < worldSize && ny >= 0 && ny < worldSize && worldGrid[ny][nx] == 1) {
            endRoomX = nx
            endRoomY = ny
            break
        }
    }
}
assignRoomTypes()
// Minimap fog: unvisited rooms hidden
let visitedGrid: number[][] = []
for (let i = 0; i < worldSize; i++) {
    let vr: number[] = []
    for (let j = 0; j < worldSize; j++) {
        vr.push(0)
    }
    visitedGrid.push(vr)
}

// roomWallSaved[worldY][worldX] = interior wall cells for that room (persists after combat clear).
let roomWallSaved: { col: number, row: number }[][][] = []
for (let wy = 0; wy < worldSize; wy++) {
    let wxRow: { col: number, row: number }[][] = []
    for (let wx = 0; wx < worldSize; wx++) {
        wxRow.push([])
    }
    roomWallSaved.push(wxRow)
}

let mySprite: Sprite = null
let minimap: Sprite = null
let swingVis: Sprite = null

let savedHasUp = false
let savedHasDown = false
let savedHasLeft = false
let savedHasRight = false

let roomCombatActive = false
let roomEnemyCount = 0
let ignoreEnemyDestroys = false
let enemyUidNext = 1
let bossHpBar: any = null
let bossSprite: Sprite = null

let faceDir = DirRight
let swordCooldown = 0
let swingBusy = false
let counterBusy = false
let aBtnHeld = false
let aHoldFrames = 0
let counterTriggeredThisHold = false
let dashCharges = 2
let dashRechargeTimer = 0
let dashBusy = false
let skillBusy = false
let playerSkills: number[] = [1, 2, 0, 0, 0]
let selectedSkillSlot = 0
let skillHotbarSprites: Sprite[] = []
let gameFrame = 0
let pendingSwingAfterFrame = -1
let skillUsedThisPress = false
let aPressInWindow = 0
let aPressWindowFrame = -1
let skillCooldownUntil: number[] = [0, 0, 0, 0, 0]
let skillIgnoresInteriorWalls = false

let playerIFrames = 0
let timeStopLeft = 0
let roomEnterGrace = 0

// White floor tile (16?16, color 1 = white in default palette) for cleared combat rooms
let whiteFloor = assets.tile`
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

let purpleFloor = assets.tile`
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    `

let redFloor = assets.tile`
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    `

let greenFloor = assets.tile`
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
    `

// enemySpawnMark ?? tilemap?level2?????????????????????????????????
let enemySpawnMark = assets.tile`
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 5 5 5 5 1 1 1 1 1 1
    1 1 1 1 1 1 5 1 1 5 1 1 1 1 1 1
    1 1 1 1 1 1 5 1 1 5 1 1 1 1 1 1
    1 1 1 1 1 1 5 5 5 5 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

// --- Player slash art (12?12), 3 frames ? user-tuned slash animations ---
function bladeImageRight(frame: number): Image {
    if (frame == 0) {
        return img`
            1 1 1 1 1 1 . . . . . .
            . 1 1 1 1 1 1 . . . . .
            . . 1 1 1 1 . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    } else if (frame == 1) {
        return img`
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . 1 1 1 1 . . . .
            . . . . . . 1 1 1 1 . . .
            . . . . . . . 1 1 1 1 . .
            . . . . . . . . 1 1 1 . .
            . . . . . . . . . 1 . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
        `
    } else {
        return img`
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . .
            . . . . . . . . . . . . 1
            . . . . . . . . . . . 1 1
            . . . . . . . . . . . 1 1
            . . . . . . . . . . 1 1 1
            . . . . . . . . . . 1 1 1
            . . . . . . . . . . 1 1 1
            . . . . . . . . . . . 1 1
        `
    }
}

function bladeImageLeft(frame: number): Image {
    if (frame == 0) {
        return img`
            . . . . . . 1 1 1 1 1 1
            . . . . . 1 1 1 1 1 1 .
            . . . . . . 1 1 1 1 . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    } else if (frame == 1) {
        return img`
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . 1 1 1 1 . . . .
            . . . 1 1 1 1 . . . . .
            . . 1 1 1 1 . . . . . .
            . . 1 1 1 . . . . . . .
            . . . 1 . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    } else {
        return img`
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            1 . . . . . . . . . . .
            1 1 . . . . . . . . . .
            1 1 . . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 . . . . . . . . . .
        `
    }
}

function bladeImageUp(frame: number): Image {
    if (frame == 0) {
        return img`
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 . . . . . . . . . .
            1 . . . . . . . . . . .
        `
    } else if (frame == 1) {
        return img`
            . . . . . . . . . . . .
            . . . . . 1 1 1 . . . .
            . . . 1 1 1 1 1 1 . . .
            . . 1 1 1 1 1 1 . . . .
            . . 1 1 1 . . . . . . .
            . . . 1 . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    } else {
        return img`
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . 1 . .
            . . . . . . . . . 1 1 .
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 .
            . . . . . . . . . 1 1 .
            . . . . . . . . . 1 . .
        `
    }
}

function bladeImageDown(frame: number): Image {
    if (frame == 0) {
        return img`
            . . . . . . . . . . . 1
            . . . . . . . . . . 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 1
            . . . . . . . . . 1 1 .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    } else if (frame == 1) {
        return img`
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . 1 . . .
            . . . . . . . 1 1 1 . .
            . . . . 1 1 1 1 1 1 . .
            . . . 1 1 1 1 1 1 . . .
            . . . . 1 1 1 . . . . .
            . . . . . . . . . . . .
        `
    } else {
        return img`
            . . 1 . . . . . . . . .
            . 1 1 . . . . . . . . .
            . 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            1 1 1 . . . . . . . . .
            . 1 1 . . . . . . . . .
            . . 1 . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
            . . . . . . . . . . . .
        `
    }
}

// dirDx returns -1, 0, or 1 for horizontal offset from a direction number.
function dirDx(dir: number): number {
    if (dir == DirLeft) {
        return -1
    } else if (dir == DirRight) {
        return 1
    }
    return 0
}

// dirDy returns -1, 0, or 1 for vertical offset from a direction number.
function dirDy(dir: number): number {
    if (dir == DirUp) {
        return -1
    } else if (dir == DirDown) {
        return 1
    }
    return 0
}

// tileLocNeighbor returns the neighbor tile for dir 0=? 1=? 2=? 3=? (no Direction enum).
function tileLocNeighbor(loc: any, dir: number) {
    return tiles.getTileLocation(loc.column + dirDx(dir), loc.row + dirDy(dir))
}

// velocityToDir maps vx/vy to a direction number 0?3.
function velocityToDir(vx: number, vy: number): number {
    if (Math.abs(vx) >= Math.abs(vy)) {
        if (vx > 0) {
            return DirRight
        }
        return DirLeft
    }
    if (vy > 0) {
        return DirDown
    }
    return DirUp
}

// swingBladeForDir returns swing sprite art for direction (0?3) and animation step (0?2).
function swingBladeForDir(dir: number, step: number): Image {
    let s = step % 3
    if (dir == DirLeft) {
        return bladeImageLeft(s)
    } else if (dir == DirRight) {
        return bladeImageRight(s)
    } else if (dir == DirUp) {
        return bladeImageUp(s)
    } else {
        return bladeImageDown(s)
    }
}

// swingBladeOffset returns slash position ? left/right stay on the player, up/down slightly ahead.
function swingBladeOffset(dir: number, step: number): { x: number; y: number } {
    if (dir == DirLeft || dir == DirRight) {
        return { x: mySprite.x, y: mySprite.y }
    }
    let dist = 2 + step * 3
    return { x: mySprite.x + dirDx(dir) * dist, y: mySprite.y + dirDy(dir) * dist }
}

// inPlayerSlashArc returns true if a point is inside the wide slash hitbox from the player.
function inPlayerSlashArc(dir: number, tx: number, ty: number): boolean {
    let dx = tx - mySprite.x
    let dy = ty - mySprite.y
    let along = dx * dirDx(dir) + dy * dirDy(dir)
    let perp = dx * (-dirDy(dir)) + dy * dirDx(dir)
    if (perp < 0) {
        perp = -perp
    }
    if (along < PLAYER_SLASH_MIN || along > PLAYER_SLASH_ALONG) {
        return false
    }
    return perp <= PLAYER_SLASH_WIDE
}

// knockbackEnemyLight pushes the enemy away from the player (bosses are immune).
function knockbackEnemyLight(e: Sprite) {
    if (spriteReadNum(e, "type", 0) == EnemyTypeBoss) {
        return
    }
    let dx = e.x - mySprite.x
    let dy = e.y - mySprite.y
    let mag = Math.sqrt(dx * dx + dy * dy)
    if (mag < 0.001) {
        dx = 1
        dy = 0
        mag = 1
    }
    e.x += (dx / mag) * ENEMY_HIT_KNOCKBACK
    e.y += (dy / mag) * ENEMY_HIT_KNOCKBACK
    if (spriteReadNum(e, "stun", 0) <= 0) {
        e.vx = (dx / mag) * ENEMY_HIT_KB_VEL
        e.vy = (dy / mag) * ENEMY_HIT_KB_VEL
    }
}

// spawnEnemyBlueHitBurst spawns a quick blue flash when an enemy is damaged.
function spawnEnemyBlueHitBurst(x: number, y: number) {
    let offs = [
        { dx: 0, dy: 0 }, { dx: 6, dy: 0 }, { dx: -6, dy: 0 },
        { dx: 0, dy: 6 }, { dx: 0, dy: -6 }, { dx: 5, dy: 5 }, { dx: -5, dy: -5 }
    ]
    for (let i = 0; i < offs.length; i++) {
        let s = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . 8 8 . . .
            . . 8 9 9 8 . .
            . . . 8 8 . . .
            . . . . . . . .
            . . . . . . . .
            `, KindHitFx)
        s.setPosition(x + offs[i].dx, y + offs[i].dy)
        s.setFlag(SpriteFlag.Ghost, true)
        s.lifespan = 140
        s.z = 155
    }
}

// tickEnemyHitFlash keeps the enemy sprite pulsing blue while hitFlash > 0.
function tickEnemyHitFlash(e: Sprite) {
    let f = spriteReadNum(e, "hitFlash", 0)
    if (f <= 0) {
        return
    }
    spriteWriteNum(e, "hitFlash", f - 1)
    if (spriteReadNum(e, "stun", 0) > 0) {
        return
    }
    if (Math.idiv(f, 3) % 2 == 0) {
        e.startEffect(effects.spray, 40)
    }
}

// playEnemyHitFx plays blue flash + light knockback when an enemy takes damage.
function playEnemyHitFx(e: Sprite) {
    knockbackEnemyLight(e)
    spawnEnemyBlueHitBurst(e.x, e.y)
    spriteWriteNum(e, "hitFlash", ENEMY_HIT_FLASH_FRAMES)
    if (spriteReadNum(e, "stun", 0) <= 0) {
        e.startEffect(effects.spray, 90)
    }
}

// spawnEnemyDeathExplosion plays a burst of particles when an enemy dies.
function spawnEnemyDeathExplosion(x: number, y: number) {
    scene.cameraShake(7, 160)
    let core = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . 2 2 2 . . .
        . 2 2 10 2 2 .
        . 2 10 10 10 2 .
        . . 2 2 2 . . .
        . . . . . . . .
        `, KindHitFx)
    core.setPosition(x, y)
    core.setScale(3)
    core.setFlag(SpriteFlag.Ghost, true)
    core.lifespan = 200
    core.z = 165
    let ring = sprites.create(img`
        . . . . . . . .
        . . 8 8 8 8 . .
        . 8 . . . . 8 .
        . 8 . . . . 8 .
        . 8 . . . . 8 .
        . . 8 8 8 8 . .
        . . . . . . . .
        `, KindHitFx)
    ring.setPosition(x, y)
    ring.setScale(2)
    ring.setFlag(SpriteFlag.Ghost, true)
    ring.lifespan = 240
    ring.z = 164
    let dirs = [
        { dx: 10, dy: 0 }, { dx: -10, dy: 0 }, { dx: 0, dy: 10 }, { dx: 0, dy: -10 },
        { dx: 7, dy: 7 }, { dx: -7, dy: 7 }, { dx: 7, dy: -7 }, { dx: -7, dy: -7 }
    ]
    for (let i = 0; i < dirs.length; i++) {
        let p = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . 2 . . . .
            . . 2 10 2 . .
            . . . 2 . . . .
            . . . . . . . .
            . . . . . . . .
            `, KindHitFx)
        p.setPosition(x + dirs[i].dx, y + dirs[i].dy)
        p.setFlag(SpriteFlag.Ghost, true)
        p.lifespan = 280
        p.z = 163
    }
}

// destroyEnemyAt removes alert marks, plays death FX, then destroys the sprite.
function destroyEnemyAt(e: Sprite) {
    destroyEnemyAlertMark(e)
    spawnEnemyDeathExplosion(e.x, e.y)
    e.destroy()
}

// applyDamageToEnemy subtracts HP, hit FX on hurt, explosion on death.
function applyDamageToEnemy(e: Sprite, amount: number) {
    let hp = spriteReadNum(e, "hp", 1)
    if (hp <= 0) {
        hp = 1
    }
    hp -= amount
    if (hp <= 0) {
        destroyEnemyAt(e)
    } else {
        spriteWriteNum(e, "hp", hp)
        playEnemyHitFx(e)
        if (spriteReadNum(e, "type", 0) == EnemyTypeBoss && bossHpBar) {
            bossHpBar.value = hp
        }
    }
}

// damageEnemyWithSword applies exactly SWORD_DAMAGE to one enemy (once per swing).
function damageEnemyWithSword(e: Sprite) {
    if (spriteReadNum(e, "lastSwing", -1) == swingSerial) {
        return
    }
    spriteWriteNum(e, "lastSwing", swingSerial)
    applyDamageToEnemy(e, SWORD_DAMAGE)
}

// damageEnemyWithCounter applies 0.2 HP per hit (2 tenths, 10 tenths = 1 HP).
function damageEnemyWithCounter(e: Sprite) {
    if (spriteReadNum(e, "lastSwing", -1) == swingSerial) {
        return
    }
    spriteWriteNum(e, "lastSwing", swingSerial)
    playEnemyHitFx(e)
    let acc = spriteReadNum(e, "dmgAcc", 0) + COUNTER_DAMAGE_TENTHS
    while (acc >= 10) {
        acc -= 10
        let hp = spriteReadNum(e, "hp", 1)
        if (hp <= 0) {
            hp = 1
        }
        hp -= 1
        if (hp <= 0) {
            destroyEnemyAt(e)
            return
        }
        spriteWriteNum(e, "hp", hp)
        if (spriteReadNum(e, "type", 0) == EnemyTypeBoss && bossHpBar) {
            bossHpBar.value = hp
        }
    }
    spriteWriteNum(e, "dmgAcc", acc)
}

// applySwordHits damages enemies only (normal attack does not destroy projectiles).
function applySwordHits(dir: number, step: number) {
    for (let e of sprites.allOfKind(KindEnemy)) {
        if (inPlayerSlashArc(dir, e.x, e.y)) {
            damageEnemyWithSword(e)
        }
    }
}

// counterBladeForDir returns a 2? larger purple copy of the slash image.
function counterBladeForDir(dir: number, step: number): Image {
    let base = swingBladeForDir(dir, step)
    let w = base.width
    let h = base.height
    let out = image.create(w, h)
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let c = base.getPixel(x, y)
            if (c == 1) {
                c = 8
            }
            out.setPixel(x, y, c)
        }
    }
    return out
}

// updateEnemyStunFlash toggles ghost on/off so stunned enemies visibly flash.
function updateEnemyStunFlash(e: Sprite, stun: number) {
    if (Math.idiv(stun, 5) % 2 == 0) {
        e.setFlag(SpriteFlag.Ghost, true)
    } else {
        e.setFlag(SpriteFlag.Ghost, false)
    }
}

// tickEnemyStun returns true while stunned (~3 s): frozen, flashing, no AI.
function tickEnemyStun(e: Sprite): boolean {
    let stun = spriteReadNum(e, "stun", 0)
    if (stun <= 0) {
        e.setFlag(SpriteFlag.Ghost, false)
        return false
    }
    spriteWriteNum(e, "stun", stun - 1)
    e.vx = 0
    e.vy = 0
    updateEnemyStunFlash(e, stun)
    if (stun % 24 == 0) {
        e.startEffect(effects.spray, 120)
    }
    return true
}

// stunEnemyFromCounter cancels windup, stuns 3 seconds, shakes screen, starts flash.
function stunEnemyFromCounter(e: Sprite) {
    if (spriteReadNum(e, "stun", 0) > 0) {
        return
    }
    cancelEnemySlashWindup(e)
    spriteWriteNum(e, "stun", ENEMY_STUN_FRAMES)
    spriteWriteNum(e, "atk", 0)
    spriteWriteNum(e, "cd", 0)
    spriteWriteNum(e, "scd", 0)
    spriteWriteNum(e, "dashT", 0)
    e.vx = 0
    e.vy = 0
    e.setFlag(SpriteFlag.Ghost, true)
    e.startEffect(effects.spray, 280)
    scene.cameraShake(STUN_CAMERA_SHAKE, STUN_CAMERA_SHAKE_MS)
}

// damageEnemyWithReflectedBullet applies heavy damage from a reflected projectile.
function damageEnemyWithReflectedBullet(e: Sprite) {
    applyDamageToEnemy(e, REFLECTED_BULLET_DAMAGE)
}

// reflectProjectile turns a bullet around and marks it to hurt enemies.
function reflectProjectile(b: Sprite) {
    spriteWriteNum(b, "pvx", -spriteReadNum(b, "pvx", 0))
    spriteWriteNum(b, "pvy", -spriteReadNum(b, "pvy", 0))
    spriteWriteNum(b, "refl", 1)
}

// applyCounterHits deals 0.2 damage, stuns melee windups, and reflects projectiles.
function applyCounterHits(dir: number, step: number) {
    for (let b of sprites.allOfKind(KindBullet)) {
        if (spriteReadNum(b, "refl", 0) == 0 && inPlayerSlashArc(dir, b.x, b.y)) {
            reflectProjectile(b)
        }
    }
    for (let e of sprites.allOfKind(KindEnemy)) {
        if (inPlayerSlashArc(dir, e.x, e.y)) {
            damageEnemyWithCounter(e)
            if (spriteReadNum(e, "windup", 0) > 0) {
                stunEnemyFromCounter(e)
            }
        }
    }
}

// checkReflectedBulletHits ? reflected shots deal heavy damage with impact FX.
function checkReflectedBulletHits() {
    for (let b of sprites.allOfKind(KindBullet)) {
        if (spriteReadNum(b, "refl", 0) != 1) {
            continue
        }
        for (let e of sprites.allOfKind(KindEnemy)) {
            let ddx = e.x - b.x
            let ddy = e.y - b.y
            if (ddx * ddx + ddy * ddy <= 121) {
                damageEnemyWithReflectedBullet(e)
                scene.cameraShake(REFLECT_HIT_CAMERA_SHAKE, REFLECT_HIT_CAMERA_SHAKE_MS)
                b.destroy()
                break
            }
        }
    }
}

// roomSkipsInteriorWalls is true for boss and mini-boss arenas (only outer walls).
function roomSkipsInteriorWalls(rx: number, ry: number): boolean {
    let rt = roomTypeGrid[ry][rx]
    return rt == RoomTypeBoss || rt == RoomTypeMiniBoss
}

// isPerimeterTile returns true for the room's outer border tiles.
function isPerimeterTile(col: number, row: number): boolean {
    return col == 0 || row == 0 || col == roomWidth - 1 || row == roomHeight - 1
}

// tryPlayerMove moves the player; ignoreInterior skips myTile0 cover but blocks outer walls.
function tryPlayerMove(dx: number, dy: number, ignoreInterior: boolean): boolean {
    let ox = mySprite.x
    let oy = mySprite.y
    mySprite.x = ox + dx
    mySprite.y = oy + dy
    let loc = tiles.locationOfSprite(mySprite)
    if (ignoreInterior) {
        if (isPerimeterTile(loc.column, loc.row) && tiles.tileAtLocationIsWall(loc)) {
            mySprite.x = ox
            mySprite.y = oy
            return false
        }
        return true
    }
    if (tiles.tileAtLocationIsWall(loc)) {
        mySprite.x = ox
        mySprite.y = oy
        return false
    }
    return true
}

// nudgeSpriteOffInteriorWall pushes a sprite out of interior wall tiles (not perimeter).
function nudgeSpriteOffInteriorWall(s: Sprite) {
    let loc = tiles.locationOfSprite(s)
    if (!tiles.tileAtLocationIsWall(loc) || isPerimeterTile(loc.column, loc.row)) {
        return
    }
    let offsets = [
        { dc: 0, dr: -1 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }, { dc: 1, dr: 0 }
    ]
    for (let i = 0; i < offsets.length; i++) {
        let ncol = loc.column + offsets[i].dc
        let nrow = loc.row + offsets[i].dr
        if (ncol < 1 || ncol > roomWidth - 2 || nrow < 1 || nrow > roomHeight - 2) {
            continue
        }
        let nloc = tiles.getTileLocation(ncol, nrow)
        if (!tiles.tileAtLocationIsWall(nloc)) {
            s.x = ncol * 16 + 8
            s.y = nrow * 16 + 8
            return
        }
    }
}

// nudgeEnemyAway pushes an enemy slightly away from the player (used when player takes damage).
function nudgeEnemyAway(enemy: Sprite) {
    let dx = enemy.x - mySprite.x
    let dy = enemy.y - mySprite.y
    let mag = Math.sqrt(dx * dx + dy * dy)
    if (mag < 0.001) {
        mag = 1
    }
    let push = 14
    enemy.x += (dx / mag) * push
    enemy.y += (dy / mag) * push
}

// floorTileForRoom returns the interior floor tile for a world room cell.
function floorTileForRoom(rx: number, ry: number): Image {
    if (combatGrid[ry][rx] == 2) {
        return whiteFloor
    }
    let rt = roomTypeGrid[ry][rx]
    if (rt == RoomTypeShop) {
        return purpleFloor
    } else if (rt == RoomTypeSkill) {
        return redFloor
    } else if (rt == RoomTypeHeal) {
        return greenFloor
    }
    return assets.tile`myTile2`
}

// paintInteriorForRoom sets inner floor tiles; skips interior walls so they stay solid.
function paintInteriorForRoom(rx: number, ry: number) {
    let floorTile = floorTileForRoom(rx, ry)
    for (let col = 1; col <= roomWidth - 2; col++) {
        for (let row = 1; row <= roomHeight - 2; row++) {
            let loc = tiles.getTileLocation(col, row)
            if (tiles.tileAtLocationIsWall(loc)) {
                continue
            }
            tiles.setTileAt(loc, floorTile)
            tiles.setWallAt(loc, false)
        }
    }
}

// captureInteriorWallsToSave remembers interior wall tiles for this world room.
function captureInteriorWallsToSave(rx: number, ry: number) {
    let cells: { col: number, row: number }[] = []
    for (let col = 1; col <= roomWidth - 2; col++) {
        for (let row = 1; row <= roomHeight - 2; row++) {
            let loc = tiles.getTileLocation(col, row)
            if (tiles.tileAtLocationIsWall(loc)) {
                cells.push({ col: col, row: row })
            }
        }
    }
    roomWallSaved[ry][rx] = cells
}

// restoreSavedRoomWalls re-builds saved interior walls after createRoom repaints the floor.
function restoreSavedRoomWalls(rx: number, ry: number) {
    let cells = roomWallSaved[ry][rx]
    for (let i = 0; i < cells.length; i++) {
        setInteriorWallAt(cells[i].col, cells[i].row)
    }
}

// markCombatRoomCleared turns this world cell into a cleared (white) room and repaints the floor.
function markCombatRoomCleared() {
    combatGrid[roomY][roomX] = 2
    paintInteriorForRoom(roomX, roomY)
    captureInteriorWallsToSave(roomX, roomY)
}

function clearRoomSprites() {
    ignoreEnemyDestroys = true
    roomEnemyCount = 0
    if (bossHpBar) {
        bossHpBar.destroy()
        bossHpBar = null
    }
    bossSprite = null
    for (let s of sprites.allOfKind(KindAlert)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindEnemy)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindBullet)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindGoal)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindHeal)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindHealFx)) {
        s.destroy()
    }
    for (let s of sprites.allOfKind(KindHitFx)) {
        s.destroy()
    }
    ignoreEnemyDestroys = false
}

// healPlayer restores HP up to PLAYER_MAX_LIFE.
function healPlayer(amount: number) {
    let cur = info.life()
    if (cur >= PLAYER_MAX_LIFE) {
        return
    }
    if (cur + amount >= PLAYER_MAX_LIFE) {
        info.setLife(PLAYER_MAX_LIFE)
    } else {
        info.changeLifeBy(amount)
    }
}

// spawnHealSpark creates a burst of sparks when a heal pickup is collected.
function spawnHealSpark(x: number, y: number) {
    let sparks = [
        { dx: 0, dy: 0 }, { dx: 6, dy: 0 }, { dx: -6, dy: 0 },
        { dx: 0, dy: 6 }, { dx: 0, dy: -6 }, { dx: 5, dy: 5 }, { dx: -5, dy: -5 }
    ]
    for (let i = 0; i < sparks.length; i++) {
        let s = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . a a . . .
            . . . a a . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            `, KindHealFx)
        s.setPosition(x + sparks[i].dx, y + sparks[i].dy)
        s.setFlag(SpriteFlag.Ghost, true)
        s.lifespan = 180
        s.z = 150
    }
}

// medKitImage returns 8?8 med-kit pickup art.
function medKitImage(): Image {
    return img`
        . . . . . . . .
        . 1 1 1 1 1 1 .
        . 1 2 2 2 2 1 .
        . 1 2 7 7 2 1 .
        . 1 2 7 7 2 1 .
        . 1 2 2 2 2 1 .
        . 1 1 1 1 1 1 .
        . . . . . . . .
        `
}

// spawnHealPickup drops a med kit at world position (x, y).
function spawnHealPickup(x: number, y: number) {
    let h = sprites.create(medKitImage(), KindHeal)
    h.setPosition(x, y)
    h.z = 80
}

// checkHealPickupNearPlayer collects heal orbs by distance (overlap backup).
function checkHealPickupNearPlayer() {
    for (let h of sprites.allOfKind(KindHeal)) {
        let ddx = mySprite.x - h.x
        let ddy = mySprite.y - h.y
        if (ddx * ddx + ddy * ddy <= 100) {
            collectHealPickup(h)
        }
    }
}

// tryDropHealOnDeath spawns a heal pickup with HEAL_DROP_PERCENT chance.
function tryDropHealOnDeath(x: number, y: number) {
    if (Math.percentChance(HEAL_DROP_PERCENT)) {
        spawnHealPickup(x, y)
    }
}

// spawnHitSparkBurst plays red sparks when an attack hits the player.
function spawnHitSparkBurst(x: number, y: number) {
    let offs = [
        { dx: 0, dy: 0 }, { dx: 5, dy: 0 }, { dx: -5, dy: 0 },
        { dx: 0, dy: 5 }, { dx: 0, dy: -5 }, { dx: 4, dy: 4 }, { dx: -4, dy: -4 }
    ]
    for (let i = 0; i < offs.length; i++) {
        let s = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . 2 2 . . .
            . . . 2 2 . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            `, KindHitFx)
        s.setPosition(x + offs[i].dx, y + offs[i].dy)
        s.setFlag(SpriteFlag.Ghost, true)
        s.lifespan = 160
        s.z = 160
    }
}

// bigSlashImageH returns a wide horizontal melee slash (8?8 art, displayed at 2? scale).
function bigSlashImageH(): Image {
    return img`
        . . . . . . . .
        . . 2 2 2 2 2 .
        . 2 2 2 2 2 2 .
        2 2 2 2 2 2 2 .
        2 2 2 2 2 2 2 .
        . 2 2 2 2 2 2 .
        . . 2 2 2 2 2 .
        . . . . . . . .
        `
}

// bigSlashImageV returns a tall vertical melee slash (8?8 art, displayed at 2? scale).
function bigSlashImageV(): Image {
    return img`
        . . . . . . . .
        . . . 2 . . . .
        . . 2 2 2 . . .
        . 2 2 2 2 2 .
        . 2 2 2 2 2 .
        . 2 2 2 2 2 .
        . . 2 2 2 . . .
        . . . 2 . . . .
        `
}

// spawnEnemyBigSlash shows a large directional slash toward the player (all enemy melee).
function spawnEnemyBigSlash(e: Sprite) {
    let dx = mySprite.x - e.x
    let dy = mySprite.y - e.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    let slashX = e.x + (dx / m) * 22
    let slashY = e.y + (dy / m) * 22
    let imgSlash = bigSlashImageH()
    if (Math.abs(dy) > Math.abs(dx)) {
        imgSlash = bigSlashImageV()
    }
    let s = sprites.create(imgSlash, KindHitFx)
    s.setScale(2)
    s.setPosition(slashX, slashY)
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = 150
    s.z = 130
}

// isNearPlayerSpawnTile is true for tiles too close to where the player stands in a room.
function isNearPlayerSpawnTile(col: number, row: number): boolean {
    if (col >= 8 && col <= 12 && row >= 5 && row <= 9) {
        return true
    }
    return false
}

// playerHitByAttack applies damage from enemy skills (not touch): shake, brief time-stop, sparks.
function playerHitByAttack(): boolean {
    if (roomEnterGrace > 0 || playerIFrames > 0) {
        return false
    }
    playerIFrames = 40
    info.changeLifeBy(-1)
    scene.cameraShake(10, 100)
    timeStopLeft = HIT_TIME_STOP_FRAMES
    spawnHitSparkBurst(mySprite.x, mySprite.y)
    return true
}

// updateTimeStop freezes movement briefly after a hit; returns true while frozen.
function updateTimeStop(): boolean {
    if (timeStopLeft <= 0) {
        return false
    }
    timeStopLeft--
    mySprite.vx = 0
    mySprite.vy = 0
    for (let e of sprites.allOfKind(KindEnemy)) {
        e.vx = 0
        e.vy = 0
    }
    return true
}

// alertMarkImage returns the Scourge Bringer-style ! above an enemy before a slash.
function alertMarkImage(): Image {
    return img`
        . . . . . . . .
        . . . 9 . . . .
        . . . . . . . .
        . . . 9 . . . .
        . . . 9 . . . .
        . . 9 9 9 . . .
        . . . 9 . . . .
        . . . 9 . . . .
        `
}

// spriteReadNumFromData reads sprite.data without creating a new data bag (safe on dying sprites).
function spriteReadNumFromData(s: Sprite, key: string, defaultVal: number): number {
    let anyS = s as any
    if (!anyS || !anyS.data) {
        return defaultVal
    }
    let v = anyS.data[key]
    if (v == undefined || v == null) {
        return defaultVal
    }
    return v
}

// destroyAlertByUid removes the ! sprite for an enemy id (never touches the enemy sprite).
function destroyAlertByUid(uid: number) {
    if (uid <= 0) {
        return
    }
    for (let s of sprites.allOfKind(KindAlert)) {
        if (spriteReadNum(s, "euid", 0) == uid) {
            s.destroy()
        }
    }
}

// showEnemyAlertMark spawns an exclamation mark above the enemy.
function showEnemyAlertMark(e: Sprite) {
    destroyEnemyAlertMark(e)
    let uid = spriteReadNum(e, "euid", 0)
    if (uid <= 0) {
        return
    }
    let m = sprites.create(alertMarkImage(), KindAlert)
    m.setFlag(SpriteFlag.Ghost, true)
    m.z = 250
    m.x = e.x
    m.y = e.y - 16
    spriteWriteNum(m, "euid", uid)
    spriteWriteNum(e, "alert", 1)
}

// updateEnemyAlertMark keeps the bouncing ! above the enemy's head during windup.
function updateEnemyAlertMark(e: Sprite) {
    let uid = spriteReadNum(e, "euid", 0)
    if (uid <= 0) {
        return
    }
    let w = spriteReadNum(e, "windup", 0)
    let bob = 0
    if (w > 0 && w % 8 < 4) {
        bob = -2
    }
    for (let m of sprites.allOfKind(KindAlert)) {
        if (spriteReadNum(m, "euid", 0) == uid) {
            m.x = e.x
            m.y = e.y - 16 + bob
            return
        }
    }
}

// destroyEnemyAlertMark removes the windup ! (only safe while the enemy sprite is alive).
function destroyEnemyAlertMark(e: Sprite) {
    let uid = spriteReadNum(e, "euid", 0)
    destroyAlertByUid(uid)
    spriteWriteNum(e, "alert", 0)
}

// cancelEnemySlashWindup ends windup early (player escaped range).
function cancelEnemySlashWindup(e: Sprite) {
    spriteWriteNum(e, "windup", 0)
    spriteWriteNum(e, "windupR", 0)
    destroyEnemyAlertMark(e)
}

// beginEnemySlashWindup freezes the enemy and shows ! (boss = 0.1s, others = 1s).
function beginEnemySlashWindup(e: Sprite, range: number) {
    let windFrames = ENEMY_SLASH_WINDUP_FRAMES
    if (spriteReadNum(e, "type", 0) == EnemyTypeBoss) {
        windFrames = BOSS_SLASH_WINDUP_FRAMES
    }
    spriteWriteNum(e, "windup", windFrames)
    spriteWriteNum(e, "windupR", range)
    spriteWriteNum(e, "dashT", 0)
    spriteWriteNum(e, "scd", 0)
    e.vx = 0
    e.vy = 0
    showEnemyAlertMark(e)
}

// finishEnemySlashWindup releases the big slash after the telegraph ends.
function finishEnemySlashWindup(e: Sprite) {
    let range = spriteReadNum(e, "windupR", 24)
    cancelEnemySlashWindup(e)
    if (enemyDistToPlayer(e) <= range) {
        spawnEnemyBigSlash(e)
        playerHitByAttack()
    }
}

// updateEnemySlashWindup runs the 1s telegraph; returns true while enemy must do nothing else.
function updateEnemySlashWindup(e: Sprite): boolean {
    let w = spriteReadNum(e, "windup", 0)
    if (w <= 0) {
        return false
    }
    if (spriteReadNum(e, "hp", 1) <= 0) {
        cancelEnemySlashWindup(e)
        return false
    }
    e.vx = 0
    e.vy = 0
    updateEnemyAlertMark(e)
    if (w == 1) {
        finishEnemySlashWindup(e)
        return true
    }
    spriteWriteNum(e, "windup", w - 1)
    return true
}

// tryEnemyMeleeAttack starts a telegraphed slash when cooldown is ready and player is in range.
function tryEnemyMeleeAttack(e: Sprite, range: number, cooldownFrames: number) {
    if (spriteReadNum(e, "type", 0) == EnemyTypeBoss) {
        return
    }
    if (spriteReadNum(e, "windup", 0) > 0) {
        return
    }
    let dist = enemyDistToPlayer(e)
    if (dist > range) {
        return
    }
    let atk = spriteReadNum(e, "atk", 0) + 1
    spriteWriteNum(e, "atk", atk)
    if (atk >= cooldownFrames) {
        spriteWriteNum(e, "atk", 0)
        if (enemyDistToPlayer(e) <= range) {
            beginEnemySlashWindup(e, range)
        }
    }
}

// collectHealPickup heals the player, plays sparks, and removes the pickup.
function collectHealPickup(pickup: Sprite) {
    let px = pickup.x
    let py = pickup.y
    pickup.destroy()
    spawnHealSpark(px, py)
    healPlayer(HEAL_PICKUP_AMOUNT)
}

// enemyDistToPlayer returns pixel distance from an enemy to the player.
function enemyDistToPlayer(e: Sprite): number {
    let dx = mySprite.x - e.x
    let dy = mySprite.y - e.y
    return Math.sqrt(dx * dx + dy * dy)
}

// enemyHitsWallIfMoved returns true if the enemy would move into a wall next step.
function enemyHitsWallIfMoved(e: Sprite, vx: number, vy: number): boolean {
    if (vx == 0 && vy == 0) {
        return false
    }
    let loc = tiles.locationOfSprite(e)
    let testLoc = tileLocNeighbor(loc, velocityToDir(vx, vy))
    return tiles.tileAtLocationIsWall(testLoc)
}

// findOpenVelocity picks vx/vy that avoid walls (writes into outVx/outVy).
function findOpenVelocity(e: Sprite, vx: number, vy: number, outVx: number[], outVy: number[]) {
    if (!enemyHitsWallIfMoved(e, vx, vy)) {
        outVx[0] = vx
        outVy[0] = vy
        return
    }
    if (!enemyHitsWallIfMoved(e, vx, 0)) {
        outVx[0] = vx
        outVy[0] = 0
        return
    }
    if (!enemyHitsWallIfMoved(e, 0, vy)) {
        outVx[0] = 0
        outVy[0] = vy
        return
    }
    if (!enemyHitsWallIfMoved(e, -vy, vx)) {
        outVx[0] = -vy
        outVy[0] = vx
        return
    }
    if (!enemyHitsWallIfMoved(e, vy, -vx)) {
        outVx[0] = vy
        outVy[0] = -vx
        return
    }
    outVx[0] = 0
    outVy[0] = 0
}

// nudgeEnemyOffWall teleports the enemy to the open neighbor tile closest to the player.
function nudgeEnemyOffWall(e: Sprite) {
    let loc = tiles.locationOfSprite(e)
    let bestDist = 99999
    let bestCol = loc.column
    let bestRow = loc.row
    let offsets = [
        { dc: 0, dr: -1 },
        { dc: 0, dr: 1 },
        { dc: -1, dr: 0 },
        { dc: 1, dr: 0 }
    ]
    for (let i = 0; i < offsets.length; i++) {
        let ncol = loc.column + offsets[i].dc
        let nrow = loc.row + offsets[i].dr
        if (ncol < 1 || ncol > roomWidth - 2 || nrow < 1 || nrow > roomHeight - 2) {
            continue
        }
        let nloc = tiles.getTileLocation(ncol, nrow)
        if (tiles.tileAtLocationIsWall(nloc)) {
            continue
        }
        let tx = ncol * 16 + 8
        let ty = nrow * 16 + 8
        let ddx = mySprite.x - tx
        let ddy = mySprite.y - ty
        let d = ddx * ddx + ddy * ddy
        if (d < bestDist) {
            bestDist = d
            bestCol = ncol
            bestRow = nrow
        }
    }
    if (bestDist < 99999) {
        tiles.placeOnTile(e, tiles.getTileLocation(bestCol, bestRow))
        spriteWriteNum(e, "stuck", 0)
    }
}

let enemyVelScratchX: number[] = [0]
let enemyVelScratchY: number[] = [0]

// setEnemyVelocitySmart sets vx/vy and slides along walls so enemies do not get trapped.
function setEnemyVelocitySmart(e: Sprite, wantVx: number, wantVy: number) {
    findOpenVelocity(e, wantVx, wantVy, enemyVelScratchX, enemyVelScratchY)
    let openVx = enemyVelScratchX[0]
    let openVy = enemyVelScratchY[0]
    e.vx = openVx
    e.vy = openVy
    let stuck = spriteReadNum(e, "stuck", 0)
    if (enemyOnWall(e) || (openVx == 0 && openVy == 0 && (wantVx != 0 || wantVy != 0))) {
        stuck++
        spriteWriteNum(e, "stuck", stuck)
        if (stuck >= 22) {
            nudgeEnemyOffWall(e)
        }
    } else if (stuck > 0) {
        spriteWriteNum(e, "stuck", stuck - 1)
    }
}

// enemyOnWall returns true when the enemy sprite is on a wall tile.
function enemyOnWall(e: Sprite): boolean {
    return tiles.tileAtLocationIsWall(tiles.locationOfSprite(e))
}

// moveEnemyTowardPlayer sets velocity to chase the player (diagonal movement).
function moveEnemyTowardPlayer(e: Sprite, speed: number) {
    let dx = mySprite.x - e.x
    let dy = mySprite.y - e.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    setEnemyVelocitySmart(e, (dx / m) * speed, (dy / m) * speed)
}

// moveEnemyAwayFromPlayer runs away from the player (shooter retreat skill).
function moveEnemyAwayFromPlayer(e: Sprite, speed: number) {
    let dx = mySprite.x - e.x
    let dy = mySprite.y - e.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    setEnemyVelocitySmart(e, -(dx / m) * speed, -(dy / m) * speed)
}

// updateNormalEnemy zigzag chase + burst dash when close.
function updateNormalEnemy(e: Sprite) {
    if (tickEnemyStun(e)) {
        return
    }
    if (updateEnemySlashWindup(e)) {
        return
    }
    let dashT = spriteReadNum(e, "dashT", 0)
    if (dashT > 0) {
        spriteWriteNum(e, "dashT", dashT - 1)
        moveEnemyTowardPlayer(e, 48)
        tryEnemyMeleeAttack(e, 26, 55)
        return
    }
    let scd = spriteReadNum(e, "scd", 0) + 1
    spriteWriteNum(e, "scd", scd)
    if (enemyDistToPlayer(e) < 58 && scd >= 85) {
        spriteWriteNum(e, "scd", 0)
        spriteWriteNum(e, "dashT", 11)
        moveEnemyTowardPlayer(e, 48)
        return
    }
    let speed = 28
    let dx = mySprite.x - e.x
    let dy = mySprite.y - e.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    let zig = spriteReadNum(e, "zig", 0) + 1
    spriteWriteNum(e, "zig", zig)
    let strafe = 0
    if (zig % 24 < 12) {
        strafe = 10
    }
    setEnemyVelocitySmart(e, (dx / m) * speed + (-dy / m) * strafe, (dy / m) * speed + (dx / m) * strafe)
    tryEnemyMeleeAttack(e, 26, 55)
}

// updateTankEnemy slow chase + charge dash + close-range stomp ring.
function updateTankEnemy(e: Sprite) {
    if (tickEnemyStun(e)) {
        return
    }
    if (updateEnemySlashWindup(e)) {
        return
    }
    let dashT = spriteReadNum(e, "dashT", 0)
    if (dashT > 0) {
        spriteWriteNum(e, "dashT", dashT - 1)
        moveEnemyTowardPlayer(e, 38)
        tryEnemyMeleeAttack(e, 30, 90)
        return
    }
    let scd = spriteReadNum(e, "scd", 0) + 1
    spriteWriteNum(e, "scd", scd)
    let dist = enemyDistToPlayer(e)
    if (dist < 40 && scd >= 100) {
        spriteWriteNum(e, "scd", 0)
        fireTankStompRing(e)
    } else if (scd >= 140) {
        spriteWriteNum(e, "scd", 0)
        spriteWriteNum(e, "dashT", 14)
        moveEnemyTowardPlayer(e, 38)
        return
    }
    moveEnemyTowardPlayer(e, 18)
    tryEnemyMeleeAttack(e, 30, 90)
}

// updateShooterEnemy moves until you enter SHOOTER_ATTACK_RADIUS, then shoots only in range.
function updateShooterEnemy(e: Sprite) {
    if (tickEnemyStun(e)) {
        return
    }
    if (updateEnemySlashWindup(e)) {
        return
    }
    let dist = enemyDistToPlayer(e)
    if (dist > SHOOTER_ATTACK_RADIUS) {
        if (dist > SHOOTER_ATTACK_RADIUS + 25) {
            moveEnemyTowardPlayer(e, 15)
        } else {
            let wcd = spriteReadNum(e, "wcd", 0) + 1
            spriteWriteNum(e, "wcd", wcd)
            if (wcd >= SHOOTER_WANDER_FRAMES) {
                spriteWriteNum(e, "wcd", 0)
                spriteWriteNum(e, "wdir", randint(0, 4))
            }
            let wdir = spriteReadNum(e, "wdir", DirRight)
            let ws = 14
            if (wdir == DirRight) {
                setEnemyVelocitySmart(e, ws, 0)
            } else if (wdir == DirLeft) {
                setEnemyVelocitySmart(e, -ws, 0)
            } else if (wdir == DirDown) {
                setEnemyVelocitySmart(e, 0, ws)
            } else if (wdir == DirUp) {
                setEnemyVelocitySmart(e, 0, -ws)
            } else {
                e.vx = 0
                e.vy = 0
            }
        }
        return
    }
    if (dist < 40) {
        moveEnemyAwayFromPlayer(e, 20)
    } else {
        e.vx = 0
        e.vy = 0
    }
    let cd = spriteReadNum(e, "cd", 0) + 1
    spriteWriteNum(e, "cd", cd)
    if (cd >= SHOOTER_FIRE_FRAMES) {
        spriteWriteNum(e, "cd", 0)
        fireShotgunBurst(e)
    }
    let scd = spriteReadNum(e, "scd", 0) + 1
    spriteWriteNum(e, "scd", scd)
    if (scd >= 110) {
        spriteWriteNum(e, "scd", 0)
        fireAimedBullet(e, 105)
    }
    tryEnemyMeleeAttack(e, 22, 75)
}

// bossImageForVariant returns sprite art for random boss type 0?2.
function bossImageForVariant(variant: number): Image {
    if (variant == BossVariantArtillery) {
        return img`
            . . . . . . . . . . . . . . . .
            . . . . . 7 7 7 7 7 7 . . . . .
            . . . 7 7 7 7 7 7 7 7 . . . .
            . . 7 7 7 7 7 7 7 7 7 7 . . .
            . . 7 7 7 7 7 7 7 7 7 7 . . .
            . . 7 7 7 7 7 7 7 7 7 7 . . .
            . . . 7 7 7 7 7 7 7 7 . . . .
            . . . . . 7 7 7 7 7 7 . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `
    } else if (variant == BossVariantBulwark) {
        return img`
            . . . . . . . . . . . . . . . .
            . . . . . 4 4 4 4 4 4 . . . . .
            . . . 4 4 4 4 4 4 4 4 . . . .
            . . 4 4 4 4 4 4 4 4 4 4 . . .
            . . 4 4 4 4 4 4 4 4 4 4 . . .
            . . 4 4 4 4 4 4 4 4 4 4 . . .
            . . 4 4 4 4 4 4 4 4 4 4 . . .
            . . . 4 4 4 4 4 4 4 4 . . . .
            . . . . . 4 4 4 4 4 4 . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `
    } else {
        return img`
            . . . . . . . . . . . . . . . .
            . . . . . 2 2 2 2 2 2 . . . . .
            . . . 2 2 2 2 2 2 2 2 . . . .
            . . 2 2 2 2 2 2 2 2 2 2 . . .
            . . 2 2 2 2 2 2 2 2 2 2 . . .
            . . 2 2 2 2 2 2 2 2 2 2 . . .
            . . . 2 2 2 2 2 2 2 2 . . . .
            . . . . . 2 2 2 2 2 2 . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            `
    }
}

// bossHpForVariant returns max HP for boss variant 0?2.
function bossHpForVariant(variant: number): number {
    if (variant == BossVariantArtillery) {
        return BOSS_HP_ARTILLERY
    } else if (variant == BossVariantBulwark) {
        return BOSS_HP_BULWARK
    }
    return BOSS_HP_BERSERKER
}

// attachBossHealthBar creates a Status Bar extension health bar on the boss.
function attachBossHealthBar(boss: Sprite, maxHp: number) {
    if (bossHpBar) {
        bossHpBar.destroy()
    }
    bossHpBar = statusbars.create(52, 8, StatusBarKind.EnemyHealth)
    bossHpBar.max = maxHp
    bossHpBar.value = maxHp
    bossHpBar.setColor(2, 15)
    bossHpBar.setBarBorder(1, 1)

    bossHpBar.setPosition(80, 2)
}

// fireBossRadialBurst fires 8 bullets in a ring (soundwave jump).
function fireBossRadialBurst(from: Sprite) {
    spawnBullet(from.x, from.y, 70, 0)
    spawnBullet(from.x, from.y, 50, 50)
    spawnBullet(from.x, from.y, 0, 70)
    spawnBullet(from.x, from.y, -50, 50)
    spawnBullet(from.x, from.y, -70, 0)
    spawnBullet(from.x, from.y, -50, -50)
    spawnBullet(from.x, from.y, 0, -70)
    spawnBullet(from.x, from.y, 50, -50)
}

// fireShotgunBurstTen fires 10 pellets in a spread (artillery backdash).
function fireShotgunBurstTen(from: Sprite) {
    let dx = mySprite.x - from.x
    let dy = mySprite.y - from.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    let bx = dx / m
    let by = dy / m
    let px = -by
    let py = bx
    let sp = 85
    for (let i = 0; i < 10; i++) {
        let off = (i - 4.5) * 0.12
        let sx = bx + px * off
        let sy = by + py * off
        let sm = Math.sqrt(sx * sx + sy * sy)
        if (sm < 0.001) {
            sm = 1
        }
        spawnBullet(from.x, from.y, (sx / sm) * sp, (sy / sm) * sp)
    }
}

// bossRoomCenter returns the arena center in pixels.
function bossRoomCenter(): { x: number, y: number } {
    return {
        x: BOSS_ROOM_CENTER_COL * 16 + 8,
        y: BOSS_ROOM_CENTER_ROW * 16 + 8
    }
}

// bossAtHalfHealthOrBelow returns true when HP is at or below 50%.
function bossAtHalfHealthOrBelow(e: Sprite): boolean {
    let hp = spriteReadNum(e, "hp", 1)
    let maxhp = spriteReadNum(e, "maxhp", 1)
    return hp * 2 <= maxhp
}

// bossDamagePlayerIfNear hits the player when within range (boss contact skills).
function bossDamagePlayerIfNear(e: Sprite, range: number) {
    if (enemyDistToPlayer(e) <= range) {
        playerHitByAttack()
    }
}

// endBossSkill clears boss skill state between attacks.
function endBossSkill(e: Sprite) {
    spriteWriteNum(e, "bskill", 0)
    spriteWriteNum(e, "bphase", 0)
    spriteWriteNum(e, "btimer", 0)
    spriteWriteNum(e, "bvx", 0)
    spriteWriteNum(e, "bvy", 0)
    spriteWriteNum(e, "bwait", BOSS_SKILL_GAP_FRAMES)
    e.vx = 0
    e.vy = 0
    destroyEnemyAlertMark(e)
}

// startBossSkill begins a timed boss attack (only big skill uses !).
function startBossSkill(e: Sprite, skillId: number, frames: number) {
    spriteWriteNum(e, "bskill", skillId)
    spriteWriteNum(e, "btimer", frames)
    spriteWriteNum(e, "bphase", 0)
    spriteWriteNum(e, "bvx", 0)
    spriteWriteNum(e, "bvy", 0)
    spriteWriteNum(e, "brot", 0)
    spriteWriteNum(e, "bstart", frames)
    e.vx = 0
    e.vy = 0
    destroyEnemyAlertMark(e)
}

// startBossBigSkill starts the half-HP ultimate (! only for artillery wind-up).
function startBossBigSkill(e: Sprite) {
    let variant = spriteReadNum(e, "bvar", BossVariantBerserker)
    if (variant == BossVariantArtillery) {
        startBossSkill(e, BossSkillArtilleryBigLaser, BOSS_BIG_ARTILLERY_FRAMES)
    } else if (variant == BossVariantBulwark) {
        startBossSkill(e, BossSkillBulwarkBigBump, BOSS_BIG_BULWARK_FRAMES)
    } else {
        startBossSkill(e, BossSkillBerserkerBigTwirl, BOSS_BIG_BERSERKER_FRAMES)
    }
}

// startBossNormalSkill cycles one of three normal moves for the boss variant.
function startBossNormalSkill(e: Sprite) {
    let variant = spriteReadNum(e, "bvar", BossVariantBerserker)
    let idx = spriteReadNum(e, "bidx", 0) % 3
    spriteWriteNum(e, "bidx", idx + 1)
    if (variant == BossVariantArtillery) {
        if (idx == 0) {
            startBossSkill(e, BossSkillArtilleryBackdash, 95)
        } else if (idx == 1) {
            startBossSkill(e, BossSkillArtilleryUzi, 110)
        } else {
            startBossSkill(e, BossSkillArtilleryRain, 130)
        }
    } else if (variant == BossVariantBulwark) {
        if (idx == 0) {
            startBossSkill(e, BossSkillBulwarkRampage, 100)
        } else if (idx == 1) {
            startBossSkill(e, BossSkillBulwarkBoomerang, 70)
        } else {
            startBossSkill(e, BossSkillBulwarkSoundwave, 85)
        }
    } else {
        if (idx == 0) {
            startBossSkill(e, BossSkillBerserkerShockwave, 55)
        } else if (idx == 1) {
            startBossSkill(e, BossSkillBerserkerDashSlash, 75)
        } else {
            startBossSkill(e, BossSkillBerserkerJumpSmash, 80)
        }
    }
}

// bossIdleMove chases or kites between skills.
function bossIdleMove(e: Sprite, variant: number) {
    let dist = enemyDistToPlayer(e)
    if (variant == BossVariantArtillery) {
        if (dist > 70) {
            moveEnemyTowardPlayer(e, 18)
        } else if (dist < 42) {
            moveEnemyAwayFromPlayer(e, 20)
        } else {
            e.vx = 0
            e.vy = 0
        }
    } else if (variant == BossVariantBulwark) {
        moveEnemyTowardPlayer(e, 14)
    } else {
        moveEnemyTowardPlayer(e, 26)
    }
}

// bossMoveTowardPixel steps the boss toward a world position.
function bossMoveTowardPixel(e: Sprite, tx: number, ty: number, speed: number) {
    let dx = tx - e.x
    let dy = ty - e.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 2) {
        e.vx = 0
        e.vy = 0
        return
    }
    setEnemyVelocitySmart(e, (dx / m) * speed, (dy / m) * speed)
}

// spawnShockwaveVisual shows expanding orange shock rings (berserker shockwave).
function spawnShockwaveVisual(x: number, y: number) {
    scene.cameraShake(12, 280)
    let scales = [2, 3, 4]
    for (let i = 0; i < scales.length; i++) {
        let s = sprites.create(img`
            . . . . . . . .
            . . 2 2 2 2 . .
            . 2 . . . . 2 .
            . 2 . 10 10 2 .
            . 2 . 10 10 2 .
            . 2 . . . . 2 .
            . . 2 2 2 2 . .
            . . . . . . . .
            `, KindHitFx)
        s.setPosition(x, y)
        s.setScale(scales[i])
        s.setFlag(SpriteFlag.Ghost, true)
        s.lifespan = 120 + i * 50
        s.z = 145
    }
}

// spawnSoundwaveVisual shows expanding blue sound rings (bulwark soundwave).
function spawnSoundwaveVisual(x: number, y: number) {
    scene.cameraShake(10, 260)
    let scales = [2, 3, 4, 5]
    for (let i = 0; i < scales.length; i++) {
        let s = sprites.create(img`
            . . . . . . . .
            . . 8 8 8 8 . .
            . 8 . . . . 8 .
            . 8 . 9 9 8 .
            . 8 . 9 9 8 .
            . 8 . . . . 8 .
            . . 8 8 8 8 . .
            . . . . . . . .
            `, KindHitFx)
        s.setPosition(x, y)
        s.setScale(scales[i])
        s.setFlag(SpriteFlag.Ghost, true)
        s.lifespan = 140 + i * 45
        s.z = 145
    }
}

// bossBumpStep moves the bulwark big skill with wall bounces.
function bossBumpStep(e: Sprite) {
    let bx = spriteReadNum(e, "bvx", 0)
    let by = spriteReadNum(e, "bvy", 0)
    if (bx == 0 && by == 0) {
        let d = randint(0, 3)
        bx = dirDx(d) * 58
        by = dirDy(d) * 58
    }
    if (enemyHitsWallIfMoved(e, bx, by) || enemyOnWall(e)) {
        bx = -bx
        by = -by
        spriteWriteNum(e, "bvx", bx)
        spriteWriteNum(e, "bvy", by)
        fireTankStompRing(e)
    } else {
        spriteWriteNum(e, "bvx", bx)
        spriteWriteNum(e, "bvy", by)
    }
    e.x += bx / 15
    e.y += by / 15
    bossDamagePlayerIfNear(e, 22)
}

// updateBossSkillActive runs the current boss skill until its timer ends.
function updateBossSkillActive(e: Sprite) {
    let skill = spriteReadNum(e, "bskill", 0)
    let t = spriteReadNum(e, "btimer", 0)
    let ph = spriteReadNum(e, "bphase", 0)
    if (t <= 0) {
        endBossSkill(e)
        return
    }
    spriteWriteNum(e, "btimer", t - 1)
    e.vx = 0
    e.vy = 0
    nudgeSpriteOffInteriorWall(e)

    if (skill == BossSkillBerserkerShockwave) {
        if (t == 55 || t == 35) {
            spawnShockwaveVisual(e.x, e.y)
        }
        if (t == 20) {
            spawnShockwaveVisual(e.x, e.y)
            fireTankStompRing(e)
            spawnEnemyBigSlash(e)
            bossDamagePlayerIfNear(e, 58)
        }
        return
    }

    if (skill == BossSkillBerserkerDashSlash) {
        if (ph == 0 && t < 60) {
            spriteWriteNum(e, "bphase", 1)
            moveEnemyTowardPlayer(e, 62)
        } else if (ph == 1) {
            moveEnemyTowardPlayer(e, 62)
            if (t < 12 || enemyDistToPlayer(e) < 30) {
                spriteWriteNum(e, "bphase", 2)
            }
        } else {
            spawnEnemyBigSlash(e)
            bossDamagePlayerIfNear(e, 38)
        }
        return
    }

    if (skill == BossSkillBerserkerJumpSmash) {
        if (ph == 0) {
            e.y -= 3
            if (t < 55) {
                spriteWriteNum(e, "bphase", 1)
            }
        } else if (ph == 1) {
            e.y += 5
            if (t < 40) {
                spriteWriteNum(e, "bphase", 2)
                scene.cameraShake(10, 220)
                fireTankStompRing(e)
                spawnEnemyBigSlash(e)
                bossDamagePlayerIfNear(e, 52)
            }
        }
        return
    }

    if (skill == BossSkillBerserkerBigTwirl) {
        if (t % 12 == 0) {
            spawnEnemyBigSlash(e)
            fireTankStompRing(e)
            bossDamagePlayerIfNear(e, 48)
        }
        moveEnemyTowardPlayer(e, 12)
        return
    }

    if (skill == BossSkillArtilleryBackdash) {
        moveEnemyAwayFromPlayer(e, 42)
        if (t % 9 == 0) {
            fireShotgunBurstTen(e)
        }
        return
    }

    if (skill == BossSkillArtilleryUzi) {
        if (t % 5 == 0) {
            fireAimedBullet(e, 105)
        }
        if (enemyDistToPlayer(e) > 55) {
            moveEnemyTowardPlayer(e, 10)
        } else {
            e.vx = 0
            e.vy = 0
        }
        return
    }

    if (skill == BossSkillArtilleryRain) {
        if (t % 7 == 0) {
            let rx = mySprite.x + randint(-50, 50)
            spawnBullet(rx, mySprite.y - 70, randint(-15, 15), 95)
        }
        e.vx = 0
        e.vy = 0
        return
    }

    if (skill == BossSkillArtilleryBigLaser) {
        let center = bossRoomCenter()
        let start = spriteReadNum(e, "bstart", BOSS_BIG_ARTILLERY_FRAMES)
        let elapsed = start - t
        if (elapsed < 110) {
            bossMoveTowardPixel(e, center.x, center.y, 40)
            destroyEnemyAlertMark(e)
        } else if (elapsed < 110 + BOSS_BIG_ARTILLERY_ALERT_FRAMES) {
            e.x = center.x
            e.y = center.y
            showEnemyAlertMark(e)
            updateEnemyAlertMark(e)
        } else {
            e.x = center.x
            e.y = center.y
            destroyEnemyAlertMark(e)
            let rot = spriteReadNum(e, "brot", 0)
            if (t % 10 == 0) {
                let d = rot % 4
                spawnLaserBullet(e.x, e.y, dirDx(d) * 165, dirDy(d) * 165)
                spawnLaserBullet(e.x, e.y, -dirDx(d) * 165, -dirDy(d) * 165)
                spriteWriteNum(e, "brot", rot + 1)
            }
        }
        return
    }

    if (skill == BossSkillBulwarkRampage) {
        moveEnemyTowardPlayer(e, 50)
        bossDamagePlayerIfNear(e, 24)
        return
    }

    if (skill == BossSkillBulwarkBoomerang) {
        if (t == 65) {
            spawnBoomerangBullet(e.x, e.y, 80, 0)
            spawnBoomerangBullet(e.x, e.y, -80, 0)
            spawnBoomerangBullet(e.x, e.y, 0, 80)
            spawnBoomerangBullet(e.x, e.y, 0, -80)
        }
        moveEnemyTowardPlayer(e, 10)
        return
    }

    if (skill == BossSkillBulwarkSoundwave) {
        if (ph == 0) {
            e.y -= 2
            if (t % 14 == 0) {
                spawnSoundwaveVisual(e.x, e.y)
            }
            if (t < 60) {
                spriteWriteNum(e, "bphase", 1)
            }
        } else if (ph == 1) {
            e.y += 4
            if (t < 45) {
                spriteWriteNum(e, "bphase", 2)
                spawnSoundwaveVisual(e.x, e.y)
                fireBossRadialBurst(e)
                bossDamagePlayerIfNear(e, 50)
            }
        } else if (t % 10 == 0) {
            spawnSoundwaveVisual(e.x, e.y)
        }
        return
    }

    if (skill == BossSkillBulwarkBigBump) {
        bossBumpStep(e)
        return
    }
}

// updateBossEnemy runs variant skill sets; half HP triggers big skill (! only on artillery).
function updateBossEnemy(e: Sprite) {
    if (tickEnemyStun(e)) {
        return
    }
    if (spriteReadNum(e, "bhalf", 0) == 0 && bossAtHalfHealthOrBelow(e)) {
        spriteWriteNum(e, "bhalf", 1)
        startBossBigSkill(e)
        return
    }
    if (spriteReadNum(e, "bskill", 0) > 0) {
        updateBossSkillActive(e)
        return
    }
    let wait = spriteReadNum(e, "bwait", 0)
    if (wait > 0) {
        spriteWriteNum(e, "bwait", wait - 1)
        bossIdleMove(e, spriteReadNum(e, "bvar", BossVariantBerserker))
        return
    }
    startBossNormalSkill(e)
}

// spawnBossAtEndRoom spawns a random boss at the victory room center with a health bar.
function spawnBossAtEndRoom() {
    let variant = randint(0, 2)
    let maxHp = bossHpForVariant(variant)
    let loc = tiles.getTileLocation(10, 7)
    if (tiles.tileAtLocationIsWall(loc)) {
        loc = tiles.getTileLocation(10, 6)
    }
    let e = sprites.create(bossImageForVariant(variant), KindEnemy)
    e.setScale(2)
    enemyUidNext++
    spriteWriteNum(e, "euid", enemyUidNext)
    spriteWriteNum(e, "type", EnemyTypeBoss)
    spriteWriteNum(e, "bvar", variant)
    spriteWriteNum(e, "hp", maxHp)
    spriteWriteNum(e, "maxhp", maxHp)
    spriteWriteNum(e, "scd", 0)
    spriteWriteNum(e, "dashT", 0)
    spriteWriteNum(e, "atk", 0)
    spriteWriteNum(e, "windup", 0)
    spriteWriteNum(e, "alert", 0)
    spriteWriteNum(e, "stuck", 0)
    spriteWriteNum(e, "bskill", 0)
    spriteWriteNum(e, "bhalf", 0)
    spriteWriteNum(e, "bidx", 0)
    spriteWriteNum(e, "bwait", 45)
    spriteWriteNum(e, "bphase", 0)
    spriteWriteNum(e, "bstart", 0)
    spriteWriteNum(e, "brot", 0)
    spriteWriteNum(e, "bvx", 0)
    spriteWriteNum(e, "bvy", 0)
    tiles.placeOnTile(e, loc)
    bossSprite = e
    attachBossHealthBar(e, maxHp)
    roomEnemyCount = 1
}

// spawnMiniBossAtRoom spawns a tougher lone enemy for mini-boss rooms.
function spawnMiniBossAtRoom() {
    let loc = tiles.getTileLocation(10, 7)
    if (tiles.tileAtLocationIsWall(loc)) {
        loc = tiles.getTileLocation(10, 6)
    }
    let e = sprites.create(bossImageForVariant(randint(0, 2)), KindEnemy)
    e.setScale(2)
    enemyUidNext++
    spriteWriteNum(e, "euid", enemyUidNext)
    spriteWriteNum(e, "type", EnemyTypeTank)
    spriteWriteNum(e, "hp", MINI_BOSS_HP)
    spriteWriteNum(e, "maxhp", MINI_BOSS_HP)
    spriteWriteNum(e, "windup", 0)
    spriteWriteNum(e, "alert", 0)
    tiles.placeOnTile(e, loc)
    roomEnemyCount = 1
}

// handleSpecialRoomEnter applies shop / heal / skill room effects once.
function handleSpecialRoomEnter(rx: number, ry: number) {
    let rt = roomTypeGrid[ry][rx]
    if (combatGrid[ry][rx] != 0) {
        return
    }
    if (rt == RoomTypeShop) {
        combatGrid[ry][rx] = 2
        healPlayer(2)
        game.splash("Shop +2 HP")
        paintInteriorForRoom(rx, ry)
    } else if (rt == RoomTypeHeal) {
        combatGrid[ry][rx] = 2
        healPlayer(4)
        game.splash("Heal +4 HP")
        paintInteriorForRoom(rx, ry)
    } else if (rt == RoomTypeSkill) {
        grantSkillFromRoom()
        combatGrid[ry][rx] = 2
        paintInteriorForRoom(rx, ry)
    }
}

// grantSkillFromRoom adds flying slash or jump smash to the first empty hotbar slot.
function grantSkillFromRoom() {
    let options = [PlayerSkillFlyingSlash, PlayerSkillJumpSmash]
    let pick = options[randint(0, options.length - 1)]
    for (let i = 2; i < SKILL_BAR_SLOTS; i++) {
        if (playerSkills[i] == 0) {
            playerSkills[i] = pick
            refreshSkillHotbar()
            game.splash("Skill slot!")
            return
        }
    }
    game.splash("Hotbar full")
}

// skillSlotNameForId returns a short label drawn inside the backpack slot.
function skillSlotNameForId(skillId: number): string {
    if (skillId == PlayerSkillFlyingSlash) {
        return "FLY"
    } else if (skillId == PlayerSkillJumpSmash) {
        return "JMP"
    }
    return ""
}

// skillBackpackSlotImage builds a 16x16 minecraft-style slot with icon and name.
function skillBackpackSlotImage(skillId: number, onCooldown: boolean, selected: boolean): Image {
    let out = image.create(16, 16)
    for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
            let border = x == 0 || y == 0 || x == 15 || y == 15
            let inner = x >= 2 && x <= 13 && y >= 2 && y <= 13
            if (border) {
                out.setPixel(x, y, selected ? 10 : 4)
            } else if (inner) {
                out.setPixel(x, y, onCooldown ? 1 : 5)
            } else {
                out.setPixel(x, y, 1)
            }
        }
    }
    if (skillId == PlayerSkillFlyingSlash) {
        for (let x = 4; x <= 11; x++) {
            out.setPixel(x, 5, onCooldown ? 1 : 2)
            out.setPixel(x, 6, onCooldown ? 1 : 8)
        }
        out.setPixel(5, 7, onCooldown ? 1 : 2)
        out.setPixel(10, 7, onCooldown ? 1 : 2)
    } else if (skillId == PlayerSkillJumpSmash) {
        for (let x = 5; x <= 10; x++) {
            for (let y = 5; y <= 9; y++) {
                out.setPixel(x, y, onCooldown ? 1 : 10)
            }
        }
    }
    let name = skillSlotNameForId(skillId)
    if (name.length >= 3) {
        out.setPixel(4, 11, onCooldown ? 1 : 7)
        out.setPixel(5, 11, onCooldown ? 1 : 7)
        out.setPixel(6, 11, onCooldown ? 1 : 7)
        out.setPixel(8, 11, onCooldown ? 1 : 7)
        out.setPixel(9, 11, onCooldown ? 1 : 7)
        out.setPixel(10, 11, onCooldown ? 1 : 7)
    }
    return out
}

// isSkillSlotOnCooldown returns true while a hotbar slot is recharging.
function isSkillSlotOnCooldown(slot: number): boolean {
    return gameFrame < skillCooldownUntil[slot]
}

// startSkillCooldownForSlot starts the 5 second reload for a hotbar slot.
function startSkillCooldownForSlot(slot: number) {
    skillCooldownUntil[slot] = gameFrame + SKILL_COOLDOWN_FRAMES
    refreshSkillHotbar()
}

// refreshSkillHotbar rebuilds the 5-slot backpack under the health bar.
function refreshSkillHotbar() {
    for (let i = 0; i < skillHotbarSprites.length; i++) {
        skillHotbarSprites[i].destroy()
    }
    skillHotbarSprites = []
    for (let i = 0; i < SKILL_BAR_SLOTS; i++) {
        let skillId = playerSkills[i]
        let cd = isSkillSlotOnCooldown(i)
        let s = sprites.create(skillBackpackSlotImage(skillId, cd, i == selectedSkillSlot), KindDashFx)
        s.setFlag(SpriteFlag.RelativeToCamera, true)
        s.setFlag(SpriteFlag.Ghost, true)
        s.left = 2 + i * 18
        s.top = 12
        s.z = 255
        skillHotbarSprites.push(s)
    }
}

// applyDashDamageHits damages enemies near the player during a dash step.
function applyDashDamageHits() {
    swingSerial++
    for (let e of sprites.allOfKind(KindEnemy)) {
        let ddx = e.x - mySprite.x
        let ddy = e.y - mySprite.y
        if (ddx * ddx + ddy * ddy <= DASH_HIT_RADIUS * DASH_HIT_RADIUS) {
            damageEnemyWithSword(e)
        }
    }
}

// damageEnemiesNearPoint hits enemies within radius of a world position.
function damageEnemiesNearPoint(x: number, y: number, radius: number) {
    swingSerial++
    for (let e of sprites.allOfKind(KindEnemy)) {
        let ddx = e.x - x
        let ddy = e.y - y
        if (ddx * ddx + ddy * ddy <= radius * radius) {
            damageEnemyWithSword(e)
        }
    }
}

// spawnJumpTargetRing shows a big circle where jump smash will land.
function spawnJumpTargetRing(x: number, y: number) {
    let ring = sprites.create(img`
        . . . . . . . .
        . . 8 8 8 8 . .
        . 8 . . . . 8 .
        . 8 . 9 9 8 .
        . 8 . 9 9 8 .
        . 8 . . . . 8 .
        . . 8 8 8 8 . .
        . . . . . . . .
        `, KindHitFx)
    ring.setPosition(x, y)
    ring.setScale(3)
    ring.setFlag(SpriteFlag.Ghost, true)
    ring.lifespan = 260
    ring.z = 120
}

// playFlyingSlash sends a large slash projectile in the facing direction.
function playFlyingSlash(dir: number, slot: number) {
    skillBusy = true
    startSkillCooldownForSlot(slot)
    let imgSlash = bigSlashImageH()
    if (dir == DirUp || dir == DirDown) {
        imgSlash = bigSlashImageV()
    }
    let slash = sprites.create(imgSlash, KindHitFx)
    slash.setScale(3)
    slash.setFlag(SpriteFlag.Ghost, true)
    slash.z = 185
    slash.x = mySprite.x + dirDx(dir) * 14
    slash.y = mySprite.y + dirDy(dir) * 14
    for (let step = 0; step < 16; step++) {
        slash.x += dirDx(dir) * 8
        slash.y += dirDy(dir) * 8
        damageEnemiesNearPoint(slash.x, slash.y, 22)
        pause(35)
    }
    slash.destroy()
    skillBusy = false
}

// playJumpSmash flies toward a direction, ignores interior walls, then smashes down.
function playJumpSmash(dir: number, slot: number) {
    skillBusy = true
    skillIgnoresInteriorWalls = true
    startSkillCooldownForSlot(slot)
    let tx = mySprite.x + dirDx(dir) * 56
    let ty = mySprite.y + dirDy(dir) * 56
    spawnJumpTargetRing(tx, ty)
    pause(120)
    for (let step = 0; step < 20; step++) {
        let dx = tx - mySprite.x
        let dy = ty - mySprite.y
        let m = Math.sqrt(dx * dx + dy * dy)
        if (m < 10) {
            break
        }
        tryPlayerMove((dx / m) * 12, (dy / m) * 12, true)
        pause(25)
    }
    for (let i = 0; i < 7; i++) {
        mySprite.y -= 5
        pause(28)
    }
    mySprite.x = tx
    mySprite.y = ty
    for (let i = 0; i < 9; i++) {
        mySprite.y += 6
        pause(24)
    }
    spawnShockwaveVisual(mySprite.x, mySprite.y)
    damageEnemiesNearPoint(mySprite.x, mySprite.y, 52)
    scene.cameraShake(10, 220)
    skillIgnoresInteriorWalls = false
    skillBusy = false
    nudgeSpriteOffInteriorWall(mySprite)
}

// registerAPressForDoubleTap counts A presses; on exactly the 2nd tap in 0.5s, casts selected slot skill.
function registerAPressForDoubleTap() {
    if (gameFrame - aPressWindowFrame > SKILL_DOUBLE_TAP_FRAMES) {
        aPressInWindow = 0
    }
    aPressWindowFrame = gameFrame
    aPressInWindow++
    if (aPressInWindow == 2) {
        aPressInWindow = 0
        skillUsedThisPress = true
        pendingSwingAfterFrame = -1
        beginPlayerSkillFromSlot(selectedSkillSlot)
    }
}

// beginPlayerSkillFromSlot casts the skill in a hotbar slot (double-tap only).
function beginPlayerSkillFromSlot(slot: number) {
    if (slot < 0 || slot >= SKILL_BAR_SLOTS) {
        return
    }
    let skillId = playerSkills[slot]
    if (skillId == 0 || skillBusy || dashBusy || swingBusy || counterBusy) {
        return
    }
    if (isSkillSlotOnCooldown(slot)) {
        return
    }
    let dir = faceDir
    if (dir < DirRight || dir > DirUp) {
        dir = DirRight
    }
    if (skillId == PlayerSkillFlyingSlash) {
        control.runInParallel(function () {
            playFlyingSlash(dir, slot)
        })
    } else if (skillId == PlayerSkillJumpSmash) {
        control.runInParallel(function () {
            playJumpSmash(dir, slot)
        })
    }
}

// onBossDefeated clears the boss fight and wins the game.
function onBossDefeated() {
    if (bossHpBar) {
        bossHpBar.destroy()
        bossHpBar = null
    }
    bossSprite = null
    roomCombatActive = false
    reopenCombatDoors()
    combatGrid[endRoomY][endRoomX] = 2
    drawMinimap()
    game.splash("?????")
    pause(500)
    game.over(true)
}

function closeCombatDoors(hasUp: boolean, hasDown: boolean, hasLeft: boolean, hasRight: boolean) {
    if (hasDown) {
        for (let c = 9; c <= 10; c++) {
            let loc = tiles.getTileLocation(c, 14)
            tiles.setTileAt(loc, assets.tile`myTile0`)
            tiles.setWallAt(loc, true)
        }
    }
    if (hasLeft) {
        for (let r = 6; r <= 8; r++) {
            let loc = tiles.getTileLocation(0, r)
            tiles.setTileAt(loc, assets.tile`myTile0`)
            tiles.setWallAt(loc, true)
        }
    }
    if (hasRight) {
        for (let r = 6; r <= 8; r++) {
            let loc = tiles.getTileLocation(19, r)
            tiles.setTileAt(loc, assets.tile`myTile0`)
            tiles.setWallAt(loc, true)
        }
    }
    if (hasUp) {
        for (let c = 9; c <= 10; c++) {
            let loc = tiles.getTileLocation(c, 0)
            tiles.setTileAt(loc, assets.tile`myTile0`)
            tiles.setWallAt(loc, true)
        }
    }
}

function reopenCombatDoors() {
    for (let c = 9; c <= 10; c++) {
        SetGate(c, 0, savedHasUp, savedHasDown, savedHasLeft, savedHasRight)
        SetGate(c, 14, savedHasUp, savedHasDown, savedHasLeft, savedHasRight)
    }
    for (let r = 6; r <= 8; r++) {
        SetGate(0, r, savedHasUp, savedHasDown, savedHasLeft, savedHasRight)
        SetGate(19, r, savedHasUp, savedHasDown, savedHasLeft, savedHasRight)
    }
}

// enemyImageForType returns the sprite art for each enemy archetype.
function enemyImageForType(typ: number): Image {
    if (typ == EnemyTypeTank) {
        return img`
            . . . . . . . . 
            . . 4 4 4 4 . . 
            . 4 4 4 4 4 4 . 
            . 4 4 4 4 4 4 . 
            . 4 4 4 4 4 4 . 
            . 4 4 4 4 4 4 . 
            . . 4 4 4 4 . . 
            . . . . . . . . 
            `
    } else if (typ == EnemyTypeTurret) {
        return img`
            . . . . . . . . 
            . . 7 7 7 7 . . 
            . 7 7 7 7 7 7 . 
            . 7 7 7 7 7 7 . 
            . 7 7 7 7 7 7 . 
            . 7 7 7 7 7 7 . 
            . . 7 7 7 7 . . 
            . . . . . . . . 
            `
    } else {
        return img`
            . . . . . . . . 
            . . 2 2 2 2 . . 
            . 2 2 2 2 2 2 . 
            . 2 2 2 2 2 2 . 
            . 2 2 2 2 2 2 . 
            . 2 2 2 2 2 2 . 
            . . 2 2 2 2 . . 
            . . . . . . . . 
            `
    }
}

// spawnEnemyAtType creates one enemy with HP/type data on a free tile.
function spawnEnemyAtType(col: number, row: number, typ: number): boolean {
    if (isNearPlayerSpawnTile(col, row)) {
        return false
    }
    let loc = tiles.getTileLocation(col, row)
    if (tiles.tileAtLocationIsWall(loc)) {
        return false
    }
    let e = sprites.create(enemyImageForType(typ), KindEnemy)
    enemyUidNext++
    spriteWriteNum(e, "euid", enemyUidNext)
    spriteWriteNum(e, "type", typ)
    if (typ == EnemyTypeTank) {
        spriteWriteNum(e, "hp", TANK_HP)
        spriteWriteNum(e, "scd", 0)
        spriteWriteNum(e, "dashT", 0)
        spriteWriteNum(e, "atk", 0)
        spriteWriteNum(e, "stuck", 0)
        spriteWriteNum(e, "windup", 0)
        spriteWriteNum(e, "alert", 0)
    } else if (typ == EnemyTypeTurret) {
        spriteWriteNum(e, "hp", SHOOTER_HP)
        spriteWriteNum(e, "cd", SHOOTER_FIRE_FRAMES - 45)
        spriteWriteNum(e, "wcd", 0)
        spriteWriteNum(e, "wdir", randint(0, 3))
        spriteWriteNum(e, "scd", 0)
        spriteWriteNum(e, "atk", 0)
        spriteWriteNum(e, "stuck", 0)
        spriteWriteNum(e, "windup", 0)
        spriteWriteNum(e, "alert", 0)
    } else {
        spriteWriteNum(e, "hp", NORMAL_HP)
        spriteWriteNum(e, "zig", 0)
        spriteWriteNum(e, "scd", 0)
        spriteWriteNum(e, "dashT", 0)
        spriteWriteNum(e, "atk", 0)
        spriteWriteNum(e, "stuck", 0)
        spriteWriteNum(e, "windup", 0)
        spriteWriteNum(e, "alert", 0)
    }
    tiles.placeOnTile(e, loc)
    roomEnemyCount++
    return true
}

// spawnBullet creates a projectile that moves manually each frame (passes through all walls).
function spawnBullet(x: number, y: number, vx: number, vy: number) {
    let b = sprites.create(img`
        . . . . . . . .
        . . . 5 5 . . .
        . . 5 5 5 5 . .
        . . 5 5 5 5 . .
        . . . 5 5 . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        `, KindBullet)
    b.setFlag(SpriteFlag.Ghost, true)
    let m = Math.sqrt(vx * vx + vy * vy)
    if (m < 1) {
        m = 1
    }
    let spawnOff = 12
    b.x = x + (vx / m) * spawnOff
    b.y = y + (vy / m) * spawnOff
    spriteWriteNum(b, "pvx", vx / 60)
    spriteWriteNum(b, "pvy", vy / 60)
    spriteWriteNum(b, "refl", 0)
    spriteWriteNum(b, "boom", 0)
    spriteWriteNum(b, "age", 0)
    b.vx = 0
    b.vy = 0
    b.lifespan = 3500
}

// spawnLaserBullet fires a fast boss laser beam.
function spawnLaserBullet(x: number, y: number, vx: number, vy: number) {
    let b = sprites.create(img`
        . . . . . . . .
        . . . 2 2 . . .
        . . 2 2 2 2 . .
        . . 2 2 2 2 . .
        . . . 2 2 . . .
        . . . . . . . .
        . . . . . . . .
        `, KindBullet)
    b.setFlag(SpriteFlag.Ghost, true)
    let m = Math.sqrt(vx * vx + vy * vy)
    if (m < 1) {
        m = 1
    }
    b.x = x + (vx / m) * 14
    b.y = y + (vy / m) * 14
    spriteWriteNum(b, "pvx", vx / 60)
    spriteWriteNum(b, "pvy", vy / 60)
    spriteWriteNum(b, "refl", 0)
    spriteWriteNum(b, "boom", 0)
    spriteWriteNum(b, "age", 0)
    b.lifespan = 4500
}

// spawnBoomerangBullet fires a projectile that reverses mid-flight.
function spawnBoomerangBullet(x: number, y: number, vx: number, vy: number) {
    spawnBullet(x, y, vx, vy)
    let list = sprites.allOfKind(KindBullet)
    if (list.length > 0) {
        let b = list[list.length - 1]
        spriteWriteNum(b, "boom", 1)
        spriteWriteNum(b, "age", 0)
    }
}

// moveAllProjectiles advances every bullet by hand so wall tiles never block them.
function moveAllProjectiles() {
    for (let b of sprites.allOfKind(KindBullet)) {
        let age = spriteReadNum(b, "age", 0) + 1
        spriteWriteNum(b, "age", age)
        if (spriteReadNum(b, "boom", 0) == 1 && age == 75) {
            spriteWriteNum(b, "pvx", -spriteReadNum(b, "pvx", 0))
            spriteWriteNum(b, "pvy", -spriteReadNum(b, "pvy", 0))
        }
        b.x += spriteReadNum(b, "pvx", 0)
        b.y += spriteReadNum(b, "pvy", 0)
        b.vx = 0
        b.vy = 0
    }
}

// fireShotgunBurst fires 3 pellets in a spread toward the player (every 3 seconds).
function fireShotgunBurst(from: Sprite) {
    let dx = mySprite.x - from.x
    let dy = mySprite.y - from.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    let bx = dx / m
    let by = dy / m
    let px = -by
    let py = bx
    let sp = 80
    let spreads = [-0.4, 0, 0.4]
    for (let i = 0; i < 3; i++) {
        let off = spreads[i]
        let sx = bx + px * off
        let sy = by + py * off
        let sm = Math.sqrt(sx * sx + sy * sy)
        if (sm < 0.001) {
            sm = 1
        }
        spawnBullet(from.x, from.y, (sx / sm) * sp, (sy / sm) * sp)
    }
}

// fireAimedBullet fires one fast shot toward the player.
function fireAimedBullet(from: Sprite, bulletSpeed: number) {
    let dx = mySprite.x - from.x
    let dy = mySprite.y - from.y
    let m = Math.sqrt(dx * dx + dy * dy)
    if (m < 1) {
        m = 1
    }
    spawnBullet(from.x, from.y, (dx / m) * bulletSpeed, (dy / m) * bulletSpeed)
}

// fireTankStompRing fires four slow bullets in a cross pattern (tank stomp skill).
function fireTankStompRing(from: Sprite) {
    spawnBullet(from.x, from.y, 55, 0)
    spawnBullet(from.x, from.y, -55, 0)
    spawnBullet(from.x, from.y, 0, 55)
    spawnBullet(from.x, from.y, 0, -55)
}

// checkBulletHitsPlayer damages the player when a projectile skill hits (not touch damage).
function checkBulletHitsPlayer() {
    for (let b of sprites.allOfKind(KindBullet)) {
        if (spriteReadNum(b, "refl", 0) == 1) {
            continue
        }
        let ddx = mySprite.x - b.x
        let ddy = mySprite.y - b.y
        if (ddx * ddx + ddy * ddy <= 144) {
            if (playerIFrames > 0) {
                b.destroy()
            } else if (playerHitByAttack()) {
                b.destroy()
            }
        }
    }
}

// collectEnemySpawnMarksAfterLoad reads enemySpawnMark tiles from level2 before the procedural room pass overwrites them.
function collectEnemySpawnMarksAfterLoad(): { col: number, row: number }[] {
    let out: { col: number, row: number }[] = []
    for (let col = 1; col <= roomWidth - 2; col++) {
        for (let row = 1; row <= roomHeight - 2; row++) {
            let loc = tiles.getTileLocation(col, row)
            if (tiles.tileAtLocationEquals(loc, enemySpawnMark)) {
                out.push({ col: col, row: row })
            }
        }
    }
    return out
}

// collectInteriorWallsFromLoad reads myTile0 placed inside level2 (before createRoom overwrites the map).
function collectInteriorWallsFromLoad(): { col: number, row: number }[] {
    let out: { col: number, row: number }[] = []
    for (let col = 1; col <= roomWidth - 2; col++) {
        for (let row = 1; row <= roomHeight - 2; row++) {
            let loc = tiles.getTileLocation(col, row)
            if (tiles.tileAtLocationEquals(loc, assets.tile`myTile0`)) {
                out.push({ col: col, row: row })
            }
        }
    }
    return out
}

// setInteriorWallAt paints one interior obstacle using the same tile as the room border (always visible).
function setInteriorWallAt(col: number, row: number) {
    let loc = tiles.getTileLocation(col, row)
    tiles.setTileAt(loc, assets.tile`myTile0`)
    tiles.setWallAt(loc, true)
}

// placeInteriorWallCell sets a wall if the cell is valid and not excluded.
function placeInteriorWallCell(col: number, row: number, excluded: { col: number, row: number }[]): boolean {
    if (col < 1 || col > roomWidth - 2 || row < 1 || row > roomHeight - 2) {
        return false
    }
    if (isCellExcludedFromRandomWalls(col, row, excluded)) {
        return false
    }
    setInteriorWallAt(col, row)
    return true
}

// restoreMapInteriorWalls re-applies walls you painted on tilemap level2.
function restoreMapInteriorWalls(cells: { col: number, row: number }[], excluded: { col: number, row: number }[]) {
    for (let i = 0; i < cells.length; i++) {
        placeInteriorWallCell(cells[i].col, cells[i].row, excluded)
    }
}

// isBadRandomWallSpot skips door lanes and spawn tiles for random wall placement.
function isBadRandomWallSpot(col: number, row: number, excluded: { col: number, row: number }[]): boolean {
    if (isCellExcludedFromRandomWalls(col, row, excluded)) {
        return true
    }
    if ((col == 9 || col == 10) && (row <= 2 || row >= 12)) {
        return true
    }
    if ((row == 6 || row == 7 || row == 8) && (col <= 2 || col >= 17)) {
        return true
    }
    return false
}

// tryPlaceRandomWallCell places one wall tile and reverts if the room becomes unreachable.
function tryPlaceRandomWallCell(col: number, row: number, floorTile: Image, excluded: { col: number, row: number }[]): boolean {
    if (isBadRandomWallSpot(col, row, excluded)) {
        return false
    }
    let loc = tiles.getTileLocation(col, row)
    if (tiles.tileAtLocationIsWall(loc)) {
        return false
    }
    setInteriorWallAt(col, row)
    if (interiorConnectivityOk()) {
        return true
    }
    tiles.setTileAt(loc, floorTile)
    tiles.setWallAt(loc, false)
    return false
}

// randomClusterOffsets returns a small random cover shape (0=2?2, 1=bar3, 2=L).
function randomClusterOffsets(kind: number): { dc: number, dr: number }[] {
    if (kind == 0) {
        return [{ dc: 0, dr: 0 }, { dc: 1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 1, dr: 1 }]
    } else if (kind == 1) {
        if (Math.percentChance(50)) {
            return [{ dc: 0, dr: 0 }, { dc: 1, dr: 0 }, { dc: 2, dr: 0 }]
        } else {
            return [{ dc: 0, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: 2 }]
        }
    } else {
        return [{ dc: 0, dr: 0 }, { dc: 1, dr: 0 }, { dc: 0, dr: 1 }]
    }
}

// tryPlaceRandomWallCluster places a random 2?4 tile cover cluster if connectivity stays valid.
function tryPlaceRandomWallCluster(anchorCol: number, anchorRow: number, floorTile: Image, excluded: { col: number, row: number }[]): boolean {
    let offs = randomClusterOffsets(randint(0, 2))
    let cols: number[] = []
    let rows: number[] = []
    for (let i = 0; i < offs.length; i++) {
        let col = anchorCol + offs[i].dc
        let row = anchorRow + offs[i].dr
        if (col < 1 || col > roomWidth - 2 || row < 1 || row > roomHeight - 2) {
            return false
        }
        if (isBadRandomWallSpot(col, row, excluded)) {
            return false
        }
        if (tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
            return false
        }
        cols.push(col)
        rows.push(row)
    }
    for (let j = 0; j < cols.length; j++) {
        setInteriorWallAt(cols[j], rows[j])
    }
    if (interiorConnectivityOk()) {
        return true
    }
    for (let j = 0; j < cols.length; j++) {
        let loc = tiles.getTileLocation(cols[j], rows[j])
        tiles.setTileAt(loc, floorTile)
        tiles.setWallAt(loc, false)
    }
    return false
}

// addRandomCombatWalls scatters random pillars and small clusters each combat room.
function addRandomCombatWalls(excluded: { col: number, row: number }[], floorTile: Image) {
    let wallTarget = randint(6, 11)
    let placed = 0
    let tries = 0
    while (placed < wallTarget && tries < 100) {
        tries++
        let col = randint(3, 16)
        let row = randint(3, 11)
        if (tryPlaceRandomWallCell(col, row, floorTile, excluded)) {
            placed++
        }
        if (tries % 15 == 0) {
            pause(0)
        }
    }
    let clusterTarget = randint(1, 3)
    let clusterDone = 0
    tries = 0
    while (clusterDone < clusterTarget && tries < 50) {
        tries++
        let col = randint(3, 15)
        let row = randint(3, 10)
        if (tryPlaceRandomWallCluster(col, row, floorTile, excluded)) {
            clusterDone++
        }
    }
}

// placeCombatRoomWalls restores editor walls then adds random interior cover (myTile0).
function placeCombatRoomWalls(mapWalls: { col: number, row: number }[], excluded: { col: number, row: number }[], rx: number, ry: number) {
    let floorTile = combatGrid[ry][rx] == 2 ? whiteFloor : assets.tile`myTile2`
    restoreMapInteriorWalls(mapWalls, excluded)
    addRandomCombatWalls(excluded, floorTile)
}

// countInteriorNonWallTiles counts inner room cells that are not wall-collidable.
function countInteriorNonWallTiles(): number {
    let n = 0
    for (let col = 1; col <= roomWidth - 2; col++) {
        for (let row = 1; row <= roomHeight - 2; row++) {
            if (!tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
                n++
            }
        }
    }
    return n
}

// interiorReachableCountFrom returns how many inner non-wall cells are reachable from the start by 4-neighbor BFS.
function interiorReachableCountFrom(startCol: number, startRow: number): number {
    if (startCol < 1 || startCol > roomWidth - 2 || startRow < 1 || startRow > roomHeight - 2) {
        return 0
    }
    let loc0 = tiles.getTileLocation(startCol, startRow)
    if (tiles.tileAtLocationIsWall(loc0)) {
        return 0
    }
    let visited: number[][] = []
    for (let i = 0; i < roomWidth; i++) {
        let vr: number[] = []
        for (let j = 0; j < roomHeight; j++) {
            vr.push(0)
        }
        visited.push(vr)
    }
    let qCol: number[] = []
    let qRow: number[] = []
    qCol.push(startCol)
    qRow.push(startRow)
    visited[startCol][startRow] = 1
    let qi = 0
    let reachable = 0
    while (qi < qCol.length) {
        let c = qCol[qi]
        let r = qRow[qi]
        qi++
        reachable++
        for (let k = 0; k < 4; k++) {
            let nc = c
            let nr = r
            if (k == 0) {
                nc = c + 1
            } else if (k == 1) {
                nc = c - 1
            } else if (k == 2) {
                nr = r + 1
            } else {
                nr = r - 1
            }
            if (nc < 1 || nc > roomWidth - 2 || nr < 1 || nr > roomHeight - 2) {
                continue
            }
            if (visited[nc][nr] != 0) {
                continue
            }
            let nloc = tiles.getTileLocation(nc, nr)
            if (tiles.tileAtLocationIsWall(nloc)) {
                continue
            }
            visited[nc][nr] = 1
            qCol.push(nc)
            qRow.push(nr)
        }
    }
    return reachable
}

// interiorConnectivityOk is true when every inner non-wall tile is reachable from any other (single connected region).
function interiorConnectivityOk(): boolean {
    let total = countInteriorNonWallTiles()
    if (total == 0) {
        return true
    }
    let startC = -1
    let startR = -1
    for (let row = 1; row <= roomHeight - 2; row++) {
        for (let col = 1; col <= roomWidth - 2; col++) {
            if (!tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))) {
                startC = col
                startR = row
                break
            }
        }
        if (startC >= 0) {
            break
        }
    }
    if (startC < 0) {
        return true
    }
    return interiorReachableCountFrom(startC, startR) == total
}

// isCellExcludedFromRandomWalls marks cells that must stay walkable for spawns or the default stand tile.
function isCellExcludedFromRandomWalls(col: number, row: number, excluded: { col: number, row: number }[]): boolean {
    if (col == 10 && row == 7) {
        return true
    }
    for (let p of excluded) {
        if (p.col == col && p.row == row) {
            return true
        }
    }
    return false
}

// shuffleSpawnList returns a shuffled copy of spawn mark positions.
function shuffleSpawnList(marks: { col: number, row: number }[]): { col: number, row: number }[] {
    let a: { col: number, row: number }[] = []
    for (let k = 0; k < marks.length; k++) {
        a.push({ col: marks[k].col, row: marks[k].row })
    }
    for (let i = a.length - 1; i >= 1; i--) {
        let j = randint(0, i)
        let t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    return a
}

// pickRandomEnemyType returns a weighted random enemy archetype for spawning.
function pickRandomEnemyType(): number {
    let r = randint(0, 99)
    if (r < 18) {
        return EnemyTypeTank
    } else if (r < 36) {
        return EnemyTypeTurret
    }
    return EnemyTypeNormal
}

function spawnEnemiesInRoom(count: number, marks: { col: number, row: number }[]) {
    roomEnemyCount = 0
    if (marks.length > 0) {
        let sh = shuffleSpawnList(marks)
        let onMarks = count
        if (onMarks > sh.length) {
            onMarks = sh.length
        }
        for (let i = 0; i < onMarks; i++) {
            spawnEnemyAtType(sh[i].col, sh[i].row, pickRandomEnemyType())
        }
    }
    let attempts = 0
    while (roomEnemyCount < count && attempts < 400) {
        attempts++
        let col = randint(2, 17)
        let row = randint(2, 12)
        spawnEnemyAtType(col, row, pickRandomEnemyType())
    }
}

// playSwing runs the full slash animation for dir (0=? 1=? 2=? 3=?).
function playSwing(dir: number) {
    swingBusy = true
    swingVis.setFlag(SpriteFlag.Invisible, false)
    swingVis.setScale(2)
    for (let step = 0; step < 3; step++) {
        let p = swingBladeOffset(dir, step)
        swingVis.setImage(swingBladeForDir(dir, step))
        swingVis.x = p.x
        swingVis.y = p.y
        applySwordHits(dir, step)
        pause(70)
    }
    swingVis.setFlag(SpriteFlag.Invisible, true)
    swingBusy = false
}

// playCounter runs the full purple 2? slash animation (same 3 frames as normal swing).
function playCounter(dir: number) {
    counterBusy = true
    playerIFrames = 24
    swingVis.setFlag(SpriteFlag.Invisible, false)
    swingVis.setScale(COUNTER_SCALE)
    for (let step = 0; step < 3; step++) {
        let p = swingBladeOffset(dir, step)
        swingVis.setImage(counterBladeForDir(dir, step))
        swingVis.x = p.x
        swingVis.y = p.y
        applyCounterHits(dir, step)
        pause(70)
    }
    swingVis.setFlag(SpriteFlag.Invisible, true)
    swingVis.setScale(2)
    counterBusy = false
}

// spawnDashAfterimage leaves a fading ghost trail during a dash.
function spawnDashAfterimage(x: number, y: number) {
    let g = sprites.create(img`
        . . . . . . . .
        . . 6 6 6 6 . .
        . 6 6 6 6 6 6 .
        . 6 6 6 6 6 6 .
        . 6 6 6 6 6 6 .
        . . 6 6 6 6 . .
        . . . . . . . .
        `, KindDashFx)
    g.setPosition(x, y)
    g.setFlag(SpriteFlag.Ghost, true)
    g.lifespan = 220
    g.z = 90
}

// spawnDashBurstRing spawns a quick ring flash at dash start or end.
function spawnDashBurstRing(x: number, y: number) {
    let ring = sprites.create(img`
        . . . . . . . .
        . . 8 8 8 8 . .
        . 8 . . . . 8 .
        . 8 . . . . 8 .
        . 8 . . . . 8 .
        . . 8 8 8 8 . .
        . . . . . . . .
        `, KindDashFx)
    ring.setPosition(x, y)
    ring.setFlag(SpriteFlag.Ghost, true)
    ring.lifespan = 160
    ring.z = 95
}

// playDash moves the player quickly in dir (0?3) with trail + screen shake.
function playDash(dir: number) {
    dashBusy = true
    mySprite.vx = 0
    mySprite.vy = 0
    playerIFrames = 14
    spawnDashBurstRing(mySprite.x, mySprite.y)
    scene.cameraShake(5, 120)
    for (let step = 0; step < DASH_STEPS; step++) {
        spawnDashAfterimage(mySprite.x, mySprite.y)
        let nx = mySprite.x + dirDx(dir) * DASH_STEP_DIST
        let ny = mySprite.y + dirDy(dir) * DASH_STEP_DIST
        mySprite.x = nx
        mySprite.y = ny
        applyDashDamageHits()
        let loc = tiles.locationOfSprite(mySprite)
        if (tiles.tileAtLocationIsWall(loc)) {
            mySprite.x = nx - dirDx(dir) * DASH_STEP_DIST
            mySprite.y = ny - dirDy(dir) * DASH_STEP_DIST
            break
        }
        pause(28)
    }
    spawnDashBurstRing(mySprite.x, mySprite.y)
    dashBusy = false
}

// beginDash spends one dash charge (max DASH_MAX_CHARGES, each refill ~0.5 sec).
function beginDash() {
    if (dashCharges < 1 || dashBusy || swingBusy || counterBusy || skillBusy) {
        return
    }
    dashCharges -= 1
    let dir = faceDir
    if (dir < DirRight || dir > DirUp) {
        dir = DirRight
    }
    control.runInParallel(function () {
        playDash(dir)
    })
}

// beginSwing starts a quick tap slash in faceDir 0?3 (runs animation in parallel).
function beginSwing() {
    if (swordCooldown > 0 || swingBusy || counterBusy || dashBusy || skillBusy) {
        return
    }
    swordCooldown = 10
    swingSerial++
    let dir = faceDir
    if (dir < DirRight || dir > DirUp) {
        dir = DirRight
    }
    control.runInParallel(function () {
        playSwing(dir)
    })
}

// beginCounter starts a hold-release counter in faceDir 0?3 (runs animation in parallel).
function beginCounter() {
    if (swingBusy || counterBusy || dashBusy || skillBusy) {
        return
    }
    swordCooldown = 14
    swingSerial++
    let dir = faceDir
    if (dir < DirRight || dir > DirUp) {
        dir = DirRight
    }
    control.runInParallel(function () {
        playCounter(dir)
    })
}

function createRoom(rx: number, ry: number) {
    visitedGrid[ry][rx] = 1
    clearRoomSprites()
    roomCombatActive = false
    tiles.loadMap(tiles.createSmallMap(tilemap`level2`))
    let markedSpawns = collectEnemySpawnMarksAfterLoad()
    let mapWalls = collectInteriorWallsFromLoad()

    let hasUp = ry > 0 && worldGrid[ry - 1][rx] == 1
    let hasDown = ry < worldSize - 1 && worldGrid[ry + 1][rx] == 1
    let hasLeft = rx > 0 && worldGrid[ry][rx - 1] == 1
    let hasRight = rx < worldSize - 1 && worldGrid[ry][rx + 1] == 1

    savedHasUp = hasUp
    savedHasDown = hasDown
    savedHasLeft = hasLeft
    savedHasRight = hasRight

    for (let col = 0; col < roomWidth; col++) {
        for (let row = 0; row < roomHeight; row++) {
            tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile2`)

            if (col == 0 || row == 0 || col == roomWidth - 1 || row == roomHeight - 1) {
                tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile0`)
                tiles.setWallAt(tiles.getTileLocation(col, row), true)
            }
            SetGate(col, row, hasUp, hasDown, hasLeft, hasRight)
        }
    }

    paintInteriorForRoom(rx, ry)

    if (combatGrid[ry][rx] == 2 && !roomSkipsInteriorWalls(rx, ry)) {
        restoreSavedRoomWalls(rx, ry)
    }

    handleSpecialRoomEnter(rx, ry)

    if (combatGrid[ry][rx] == 1) {
        roomEnterGrace = ROOM_ENTER_GRACE_FRAMES
        pause(0)
        let rt = roomTypeGrid[ry][rx]
        if (!roomSkipsInteriorWalls(rx, ry)) {
            placeCombatRoomWalls(mapWalls, markedSpawns, rx, ry)
            pause(0)
            captureInteriorWallsToSave(rx, ry)
        } else {
            roomWallSaved[ry][rx] = []
        }
        closeCombatDoors(hasUp, hasDown, hasLeft, hasRight)
        roomCombatActive = true
        if (rt == RoomTypeBoss) {
            spawnBossAtEndRoom()
        } else if (rt == RoomTypeMiniBoss) {
            spawnMiniBossAtRoom()
        } else {
            spawnEnemiesInRoom(randint(3, 5), markedSpawns)
        }
        if (roomEnemyCount == 0) {
            roomCombatActive = false
            reopenCombatDoors()
        }
    }

    drawMinimap()
}

function SetGate(col: number, row: number, up: boolean, down: boolean, left: boolean, right: boolean) {
    if (down && col >= 9 && col <= 10 && row == 14) {
        tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile1`)
        tiles.setWallAt(tiles.getTileLocation(col, row), false)
    }
    if (left && col == 0 && row >= 6 && row <= 8) {
        tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile1`)
        tiles.setWallAt(tiles.getTileLocation(col, row), false)
    }
    if (right && col == 19 && row >= 6 && row <= 8) {
        tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile1`)
        tiles.setWallAt(tiles.getTileLocation(col, row), false)
    }
    if (up && col >= 9 && col <= 10 && row == 0) {
        tiles.setTileAt(tiles.getTileLocation(col, row), assets.tile`myTile1`)
        tiles.setWallAt(tiles.getTileLocation(col, row), false)
    }
}

function drawMinimap() {
    if (minimap) {
        minimap.destroy()
    }

    let mapImg = image.create(worldSize * 2, worldSize * 2)
    mapImg.fill(15)

    for (let y = 0; y < worldSize; y++) {
        for (let x = 0; x < worldSize; x++) {
            if (worldGrid[y][x] == 1) {
                let px = x * 2
                let py = y * 2
                if (visitedGrid[y][x] != 1) {
                    continue
                }
                if (x == roomX && y == roomY) {
                    mapImg.setPixel(px, py, 9)
                } else if (x == endRoomX && y == endRoomY) {
                    mapImg.setPixel(px, py, 5)
                } else if (x == startX && y == startY) {
                    mapImg.setPixel(px, py, 2)
                } else if (roomTypeGrid[y][x] == RoomTypeShop) {
                    mapImg.setPixel(px, py, 8)
                } else if (roomTypeGrid[y][x] == RoomTypeSkill) {
                    mapImg.setPixel(px, py, 2)
                } else if (roomTypeGrid[y][x] == RoomTypeHeal) {
                    mapImg.setPixel(px, py, 7)
                } else if (roomTypeGrid[y][x] == RoomTypeMiniBoss) {
                    mapImg.setPixel(px, py, 10)
                } else if (combatGrid[y][x] == 1) {
                    mapImg.setPixel(px, py, 4)
                } else if (combatGrid[y][x] == 2) {
                    mapImg.setPixel(px, py, 1)
                } else {
                    mapImg.setPixel(px, py, 1)
                }
            }
        }
    }

    minimap = sprites.create(mapImg, SpriteKind.Food)
    minimap.setFlag(SpriteFlag.RelativeToCamera, true)
    minimap.setFlag(SpriteFlag.Ghost, true)
    minimap.top = 4
    minimap.left = screen.width - minimap.width - 4
}

scene.onOverlapTile(SpriteKind.Player, assets.tile`myTile1`, function (sprite, location) {
    if (location.row == 0) {
        roomY -= 1
        createRoom(roomX, roomY)
        tiles.placeOnTile(mySprite, tiles.getTileLocation(9, 13))
    } else if (location.row == 14) {
        roomY += 1
        createRoom(roomX, roomY)
        tiles.placeOnTile(mySprite, tiles.getTileLocation(9, 1))
    } else if (location.column == 0) {
        roomX -= 1
        createRoom(roomX, roomY)
        tiles.placeOnTile(mySprite, tiles.getTileLocation(18, 7))
    } else if (location.column == 19) {
        roomX += 1
        createRoom(roomX, roomY)
        tiles.placeOnTile(mySprite, tiles.getTileLocation(1, 7))
    }
})

// Touch enemies: no damage ? hurts only from bullets + enemy melee skills (tryEnemyMeleeAttack).

sprites.onOverlap(SpriteKind.Player, KindBullet, function (player, bullet) {
    if (playerIFrames > 0) {
        bullet.destroy()
    }
})

sprites.onOverlap(SpriteKind.Player, KindHeal, function (player, pickup) {
    collectHealPickup(pickup)
})

sprites.onDestroyed(KindEnemy, function (sprite) {
    destroyAlertByUid(spriteReadNumFromData(sprite, "euid", 0))
    if (ignoreEnemyDestroys) {
        return
    }
    if (spriteReadNumFromData(sprite, "type", 0) == EnemyTypeBoss) {
        onBossDefeated()
        return
    }
    tryDropHealOnDeath(sprite.x, sprite.y)
    roomEnemyCount--
    if (roomCombatActive && roomEnemyCount <= 0) {
        roomCombatActive = false
        reopenCombatDoors()
        markCombatRoomCleared()
        drawMinimap()
    }
})

game.onUpdate(function () {
    gameFrame++
    if (swordCooldown > 0) {
        swordCooldown--
    }
    if (dashCharges < DASH_MAX_CHARGES) {
        dashRechargeTimer++
        if (dashRechargeTimer >= DASH_RECHARGE_FRAMES) {
            dashRechargeTimer = 0
            dashCharges += 1
        }
    } else {
        dashRechargeTimer = 0
    }
    if (playerIFrames > 0) {
        playerIFrames--
    }
    if (roomEnterGrace > 0) {
        roomEnterGrace--
    }
    if (dashBusy) {
        mySprite.vx = 0
        mySprite.vy = 0
    }

    if (controller.left.isPressed()) {
        faceDir = DirLeft
    } else if (controller.right.isPressed()) {
        faceDir = DirRight
    } else if (controller.up.isPressed()) {
        faceDir = DirUp
    } else if (controller.down.isPressed()) {
        faceDir = DirDown
    }

    for (let e of sprites.allOfKind(KindEnemy)) {
        tickEnemyHitFlash(e)
    }

    if (updateTimeStop()) {
        for (let e of sprites.allOfKind(KindEnemy)) {
            updateEnemySlashWindup(e)
        }
    } else {
        moveAllProjectiles()
        checkReflectedBulletHits()
        checkBulletHitsPlayer()

        if (aBtnHeld && !swingBusy && !counterBusy && !dashBusy && !skillUsedThisPress) {
            aHoldFrames++
            if (!counterTriggeredThisHold && aHoldFrames >= COUNTER_HOLD_FRAMES) {
                counterTriggeredThisHold = true
                beginCounter()
            }
        }

        for (let e of sprites.allOfKind(KindEnemy)) {
            let typ = spriteReadNum(e, "type", 0)
            if (typ == EnemyTypeBoss) {
                updateBossEnemy(e)
            } else if (typ == EnemyTypeTurret) {
                updateShooterEnemy(e)
            } else if (typ == EnemyTypeTank) {
                updateTankEnemy(e)
            } else {
                updateNormalEnemy(e)
            }
        }
    }

    checkHealPickupNearPlayer()

    if (gameFrame % 20 == 0) {
        refreshSkillHotbar()
    }

    if (pendingSwingAfterFrame > 0 && gameFrame >= pendingSwingAfterFrame) {
        pendingSwingAfterFrame = -1
        if (!aBtnHeld && !swingBusy && !counterBusy && !skillBusy && !dashBusy) {
            beginSwing()
        }
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    aBtnHeld = true
    aHoldFrames = 0
    counterTriggeredThisHold = false
    skillUsedThisPress = false
    registerAPressForDoubleTap()
})

controller.A.onEvent(ControllerButtonEvent.Released, function () {
    aBtnHeld = false
    if (counterTriggeredThisHold) {
        return
    }
    if (skillUsedThisPress) {
        return
    }
    pendingSwingAfterFrame = gameFrame + SKILL_DOUBLE_TAP_FRAMES
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (dashBusy || swingBusy || counterBusy || skillBusy) {
        return
    }
    selectedSkillSlot += 1
    if (selectedSkillSlot >= SKILL_BAR_SLOTS) {
        selectedSkillSlot = 0
    }
    refreshSkillHotbar()
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    beginDash()
})

info.setLife(PLAYER_MAX_LIFE)
profilelife.setMaxLife(10)
mySprite = sprites.create(img`
    . . . . . . . . 
    . . 1 1 1 1 . . 
    . 1 1 1 1 1 1 . 
    . 1 1 1 1 1 1 . 
    . 1 1 1 1 1 1 . 
    . 1 1 1 1 1 1 . 
    . . 1 1 1 1 . . 
    . . . . . . . . 
    `, SpriteKind.Player)
controller.moveSprite(mySprite)

swingVis = sprites.create(swingBladeForDir(DirRight, 0), KindBladeVis)
swingVis.setFlag(SpriteFlag.Ghost, true)
swingVis.setFlag(SpriteFlag.Invisible, true)
swingVis.setScale(2)
swingVis.z = 200

refreshSkillHotbar()
createRoom(roomX, roomY)
tiles.placeOnTile(mySprite, tiles.getTileLocation(10, 7))
