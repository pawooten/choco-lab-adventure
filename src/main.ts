import Phaser from 'phaser'
import './style.css'

type GameStatus = 'title' | 'playing' | 'won' | 'game-over'
type GameMode = 'normal' | 'casual'

declare global {
  interface Window {
    chocoGame: Phaser.Game
    chocoGameState: {
      status: GameStatus
      biscuits: number
      totalBiscuits: number
      lives: number
      mode: GameMode
    }
    chocoMusic: MeadowMusic
  }
}

const GAME_WIDTH = 960
const GAME_HEIGHT = 540
const WORLD_WIDTH = 7200
const GROUND_Y = 480

const controls = {
  left: false,
  right: false,
  jump: false,
}

const gameState = {
  status: 'title' as GameStatus,
  biscuits: 0,
  totalBiscuits: 0,
  lives: 3,
  mode: 'normal' as GameMode,
}

window.chocoGameState = gameState

class MeadowMusic {
  private context: AudioContext | undefined
  private masterGain: GainNode | undefined
  private nextStepTime = 0
  private step = 0
  private enabled = true
  private readonly tempo = 112
  private readonly melody = [
    76, 79, 81, 79, 76, 74, 72, 74,
    76, 79, 83, 81, 79, 76, 74, 0,
    72, 76, 79, 76, 74, 72, 69, 72,
    74, 77, 81, 79, 76, 74, 72, 0,
  ]
  private readonly chordRoots = [60, 67, 69, 65]
  private readonly chordIntervals = [
    [0, 4, 7, 12],
    [0, 4, 7, 12],
    [0, 3, 7, 12],
    [0, 4, 7, 12],
  ]

  async start() {
    if (!this.context) {
      this.context = new AudioContext()
      this.masterGain = this.context.createGain()
      this.masterGain.gain.value = this.enabled ? 0.13 : 0
      this.masterGain.connect(this.context.destination)
      this.nextStepTime = this.context.currentTime + 0.08
      window.setInterval(() => this.scheduleAhead(), 40)
    }

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  async toggle() {
    this.enabled = !this.enabled
    if (this.enabled) {
      await this.start()
    }
    this.setVolume(this.enabled ? 0.13 : 0)
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }

  isPlaying() {
    return this.enabled && this.context?.state === 'running'
  }

  private setVolume(value: number) {
    if (!this.context || !this.masterGain) {
      return
    }
    const now = this.context.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.linearRampToValueAtTime(value, now + 0.12)
  }

  private scheduleAhead() {
    if (!this.context) {
      return
    }
    const secondsPerStep = 60 / this.tempo / 2
    while (this.nextStepTime < this.context.currentTime + 0.2) {
      this.scheduleStep(this.step, this.nextStepTime, secondsPerStep)
      this.nextStepTime += secondsPerStep
      this.step = (this.step + 1) % this.melody.length
    }
  }

  private scheduleStep(step: number, time: number, duration: number) {
    const phrase = Math.floor(step / 8)
    const chordRoot = this.chordRoots[phrase]
    const chord = this.chordIntervals[phrase]
    const melodyNote = this.melody[step]

    if (melodyNote) {
      this.scheduleTone(melodyNote, time, duration * 0.82, 'square', 0.19)
    }

    if (step % 2 === 0) {
      const arpeggioNote = chordRoot + chord[(step / 2) % chord.length]
      this.scheduleTone(arpeggioNote, time, duration * 1.7, 'triangle', 0.09)
    }

    if (step % 4 === 0) {
      this.scheduleTone(chordRoot - 24, time, duration * 3.2, 'triangle', 0.16)
      this.scheduleKick(time)
    } else if (step % 4 === 2) {
      this.scheduleTick(time)
    }

    if (step === 7 || step === 23) {
      this.scheduleTone(88, time, duration * 0.4, 'sine', 0.07)
      this.scheduleTone(91, time + duration * 0.35, duration * 0.5, 'sine', 0.055)
    }
  }

  private scheduleTone(
    midiNote: number,
    time: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) {
    if (!this.context || !this.masterGain) {
      return
    }
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(440 * 2 ** ((midiNote - 69) / 12), time)
    envelope.gain.setValueAtTime(0.001, time)
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.018)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + duration)
    oscillator.connect(envelope)
    envelope.connect(this.masterGain)
    oscillator.start(time)
    oscillator.stop(time + duration + 0.02)
  }

  private scheduleKick(time: number) {
    if (!this.context || !this.masterGain) {
      return
    }
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(115, time)
    oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.12)
    envelope.gain.setValueAtTime(0.11, time)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.14)
    oscillator.connect(envelope)
    envelope.connect(this.masterGain)
    oscillator.start(time)
    oscillator.stop(time + 0.15)
  }

  private scheduleTick(time: number) {
    if (!this.context || !this.masterGain) {
      return
    }
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(1550, time)
    envelope.gain.setValueAtTime(0.025, time)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.035)
    oscillator.connect(envelope)
    envelope.connect(this.masterGain)
    oscillator.start(time)
    oscillator.stop(time + 0.04)
  }
}

const meadowMusic = new MeadowMusic()
window.chocoMusic = meadowMusic

const pixelTexture = (
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  pixels: Array<[number, number, number, number, number]>,
) => {
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false)
  pixels.forEach(([color, x, y, w, h]) => {
    graphics.fillStyle(color, 1)
    graphics.fillRect(x, y, w, h)
  })
  graphics.generateTexture(key, width, height)
  graphics.destroy()
}

const createPixelArt = (scene: Phaser.Scene) => {
  const outline = 0x261b1a
  const chocolate = 0x58352b
  const chocolateLight = 0x815443
  const chocolateDark = 0x3a241f
  const cream = 0xf7ddae
  const pink = 0xf49aa5
  const blue = 0x4bb6db

  const dogBase: Array<[number, number, number, number, number]> = [
    [outline, 8, 8, 12, 10],
    [outline, 36, 8, 12, 10],
    [chocolateDark, 8, 10, 10, 18],
    [chocolateDark, 38, 10, 10, 18],
    [outline, 14, 7, 30, 33],
    [chocolate, 16, 9, 26, 29],
    [chocolateLight, 20, 12, 18, 15],
    [outline, 20, 19, 4, 5],
    [outline, 34, 19, 4, 5],
    [cream, 22, 20, 2, 2],
    [cream, 34, 20, 2, 2],
    [cream, 22, 27, 16, 9],
    [outline, 27, 27, 7, 5],
    [pink, 29, 34, 4, 4],
    [blue, 17, 37, 24, 5],
    [outline, 10, 40, 38, 8],
    [chocolate, 12, 39, 34, 7],
  ]

  pixelTexture(scene, 'choco-idle', 56, 52, [
    ...dogBase,
    [outline, 13, 45, 9, 7],
    [outline, 36, 45, 9, 7],
    [chocolateDark, 15, 43, 6, 7],
    [chocolateDark, 38, 43, 6, 7],
    [outline, 46, 39, 9, 5],
    [chocolate, 46, 40, 8, 3],
  ])

  pixelTexture(scene, 'choco-run-1', 56, 52, [
    ...dogBase,
    [outline, 12, 45, 12, 6],
    [outline, 35, 43, 8, 9],
    [chocolateDark, 14, 44, 9, 5],
    [chocolateDark, 37, 42, 5, 8],
    [outline, 46, 36, 10, 5],
    [chocolate, 46, 37, 9, 3],
  ])

  pixelTexture(scene, 'choco-run-2', 56, 52, [
    ...dogBase,
    [outline, 15, 42, 8, 10],
    [outline, 34, 45, 12, 6],
    [chocolateDark, 17, 42, 5, 8],
    [chocolateDark, 36, 44, 9, 5],
    [outline, 46, 42, 9, 5],
    [chocolate, 46, 43, 8, 3],
  ])

  pixelTexture(scene, 'choco-jump', 56, 52, [
    ...dogBase,
    [outline, 13, 42, 10, 7],
    [outline, 35, 42, 10, 7],
    [chocolateDark, 15, 42, 7, 5],
    [chocolateDark, 37, 42, 7, 5],
    [outline, 45, 34, 10, 5],
    [chocolate, 45, 35, 9, 3],
  ])

  pixelTexture(scene, 'biscuit', 28, 20, [
    [0x8a542b, 4, 2, 20, 16],
    [0xc98b4a, 6, 4, 16, 12],
    [0xf1bc68, 8, 5, 12, 10],
    [0x8a542b, 10, 7, 3, 3],
    [0x8a542b, 17, 10, 3, 3],
    [0x8a542b, 3, 5, 4, 4],
    [0x8a542b, 21, 11, 4, 4],
  ])

  pixelTexture(scene, 'hotdog', 38, 24, [
    [0x6f361f, 2, 6, 34, 14],
    [0xe6a75e, 4, 4, 30, 16],
    [0xc84635, 7, 8, 24, 9],
    [0xf6d24a, 8, 10, 5, 3],
    [0xf6d24a, 14, 8, 5, 3],
    [0xf6d24a, 20, 10, 5, 3],
    [0xf6d24a, 26, 8, 4, 3],
  ])

  pixelTexture(scene, 'raccoon', 48, 42, [
    [outline, 5, 6, 12, 13],
    [outline, 31, 6, 12, 13],
    [0x555963, 8, 8, 32, 30],
    [0x898e98, 11, 12, 26, 20],
    [outline, 12, 17, 24, 9],
    [cream, 14, 18, 7, 6],
    [cream, 27, 18, 7, 6],
    [outline, 17, 19, 3, 3],
    [outline, 28, 19, 3, 3],
    [outline, 21, 25, 7, 5],
    [0x555963, 7, 34, 34, 6],
    [outline, 9, 38, 10, 4],
    [outline, 29, 38, 10, 4],
  ])

  pixelTexture(scene, 'bee', 34, 28, [
    [0xd9f2f1, 1, 2, 12, 9],
    [0xd9f2f1, 21, 2, 12, 9],
    [outline, 8, 8, 20, 15],
    [0xf2c94c, 10, 9, 16, 13],
    [outline, 14, 9, 4, 13],
    [outline, 22, 9, 4, 13],
    [outline, 27, 12, 5, 4],
  ])

  pixelTexture(scene, 'doghouse', 96, 94, [
    [0x5f351e, 8, 32, 80, 58],
    [0xc95a3f, 4, 30, 88, 12],
    [0xc95a3f, 14, 20, 68, 18],
    [0xc95a3f, 25, 10, 46, 16],
    [0xf5c77a, 17, 42, 62, 46],
    [0x5f351e, 34, 52, 30, 36],
    [0x2d201d, 39, 57, 20, 31],
    [cream, 19, 45, 58, 7],
    [0xf8e6b5, 31, 20, 34, 11],
    [chocolate, 38, 22, 20, 7],
  ])

  pixelTexture(scene, 'ground', 64, 64, [
    [0x4f873d, 0, 0, 64, 12],
    [0x71a94f, 0, 0, 64, 5],
    [0x7a5033, 0, 12, 64, 52],
    [0x6a432a, 7, 22, 12, 5],
    [0x9b6a42, 33, 17, 17, 6],
    [0x5d3825, 21, 42, 15, 5],
    [0x9b6a42, 47, 50, 12, 5],
  ])

  pixelTexture(scene, 'platform', 96, 28, [
    [0x486f36, 0, 0, 96, 8],
    [0x70a74f, 0, 0, 96, 4],
    [0x795238, 4, 8, 88, 18],
    [0x9c714e, 12, 11, 25, 5],
    [0x5f3d2a, 52, 17, 30, 5],
  ])

  pixelTexture(scene, 'heart', 28, 24, [
    [0x6b2331, 2, 4, 10, 10],
    [0x6b2331, 16, 4, 10, 10],
    [0xe84f68, 4, 2, 8, 10],
    [0xe84f68, 16, 2, 8, 10],
    [0xe84f68, 7, 8, 16, 9],
    [0xe84f68, 10, 15, 10, 5],
    [0xe84f68, 13, 20, 4, 3],
  ])

  pixelTexture(scene, 'spark', 12, 12, [
    [0xfff6ba, 5, 0, 2, 12],
    [0xfff6ba, 0, 5, 12, 2],
    [0xf5ca52, 3, 3, 6, 6],
  ])

  pixelTexture(scene, 'cloud', 128, 54, [
    [0xe8f6ff, 20, 19, 88, 28],
    [0xffffff, 32, 8, 39, 34],
    [0xffffff, 62, 13, 35, 30],
    [0xffffff, 11, 28, 108, 20],
  ])

  pixelTexture(scene, 'tree', 92, 150, [
    [0x765036, 39, 76, 16, 74],
    [0x5f3d29, 46, 87, 8, 63],
    [0x2f6f3d, 8, 25, 76, 66],
    [0x458c4f, 0, 42, 60, 52],
    [0x5da85d, 31, 0, 50, 68],
    [0x75ba68, 13, 15, 42, 51],
  ])

  pixelTexture(scene, 'flower', 18, 30, [
    [0x3e7d42, 8, 12, 3, 18],
    [0xf7d35c, 6, 3, 7, 7],
    [pink, 1, 4, 7, 7],
    [pink, 10, 4, 7, 7],
    [pink, 6, 0, 7, 7],
    [pink, 6, 8, 7, 7],
  ])
}

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene')
  }

  create() {
    gameState.status = 'title'
    this.cameras.main.setBackgroundColor('#82c8e8')
    createPixelArt(this)

    for (let i = 0; i < 5; i += 1) {
      this.add.image(110 + i * 205, 110 + (i % 2) * 50, 'cloud').setScale(0.7)
    }

    this.add.rectangle(GAME_WIDTH / 2, 455, GAME_WIDTH, 170, 0x69a84f)
    this.add.rectangle(GAME_WIDTH / 2, 500, GAME_WIDTH, 80, 0x765036)

    const dog = this.add.image(480, 338, 'choco-idle').setScale(2.3)
    this.tweens.add({
      targets: dog,
      y: 328,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add
      .text(480, 70, 'CHOCO’S BISCUIT QUEST', {
        fontFamily: '"Courier New", monospace',
        fontSize: '46px',
        color: '#4a2b25',
        stroke: '#fff4d6',
        strokeThickness: 8,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(480, 137, 'A tiny dog. A very big adventure.', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#4a2b25',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(480, 374, 'CHOOSE A MODE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#4a2b25',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const normalButton = this.add
      .text(390, 405, 'NORMAL', {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#fff9df',
        padding: { x: 13, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const casualButton = this.add
      .text(570, 405, 'CASUAL · NO DAMAGE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#4a2b25',
        padding: { x: 13, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const updateModeButtons = () => {
      const normalSelected = gameState.mode === 'normal'
      normalButton.setBackgroundColor(normalSelected ? '#784536' : '#fff4d6')
      normalButton.setColor(normalSelected ? '#fff9df' : '#4a2b25')
      casualButton.setBackgroundColor(normalSelected ? '#fff4d6' : '#784536')
      casualButton.setColor(normalSelected ? '#4a2b25' : '#fff9df')
    }

    const selectMode = (mode: GameMode) => {
      gameState.mode = mode
      updateModeButtons()
    }

    normalButton.on('pointerdown', () => selectMode('normal'))
    casualButton.on('pointerdown', () => selectMode('casual'))
    updateModeButtons()

    const start = this.add
      .text(480, 458, 'PRESS SPACE OR TAP TO PLAY', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#fff9df',
        backgroundColor: '#784536',
        padding: { x: 18, y: 9 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: start, alpha: 0.45, duration: 650, yoyo: true, repeat: -1 })

    this.add
      .text(480, 512, 'Run: ← → / A D     Jump: SPACE / W / ↑     Mode: N / C', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#fff9df',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const begin = () => {
      if (this.scene.isActive()) {
        void meadowMusic.start()
        this.scene.start('GameScene')
      }
    }
    this.input.keyboard?.once('keydown-SPACE', begin)
    this.input.keyboard?.on('keydown-N', () => selectMode('normal'))
    this.input.keyboard?.on('keydown-C', () => selectMode('casual'))
    this.input.keyboard?.on('keydown-LEFT', () => selectMode('normal'))
    this.input.keyboard?.on('keydown-RIGHT', () => selectMode('casual'))
    start.on('pointerdown', begin)
  }
}

class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: Record<'left' | 'right' | 'jump', Phaser.Input.Keyboard.Key>
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private biscuits!: Phaser.Physics.Arcade.Group
  private hotdogs!: Phaser.Physics.Arcade.Group
  private enemies!: Phaser.Physics.Arcade.Group
  private biscuitText!: Phaser.GameObjects.Text
  private livesGroup!: Phaser.GameObjects.Group
  private checkpointX = 120
  private isInvulnerable = false
  private isComplete = false

  constructor() {
    super('GameScene')
  }

  create() {
    gameState.status = 'playing'
    gameState.biscuits = 0
    gameState.lives = 3
    controls.left = false
    controls.right = false
    controls.jump = false

    if (!this.textures.exists('choco-idle')) {
      createPixelArt(this)
    }

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.physics.world.setBoundsCollision(true, true, true, false)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBackgroundColor('#88cfed')

    this.createBackground()
    this.createLevel()
    this.createAnimations()

    this.player = this.physics.add.sprite(120, 405, 'choco-idle')
    this.player.setCollideWorldBounds(true)
    this.player.setSize(38, 42).setOffset(9, 8)
    this.player.setMaxVelocity(330, 750)
    this.player.setDragX(1400)

    this.cameras.main.startFollow(this.player, true, 0.11, 0.11, -180, 50)
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.overlap(this.player, this.biscuits, this.collectBiscuit, undefined, this)
    this.physics.add.overlap(this.player, this.hotdogs, this.collectHotdog, undefined, this)
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    }

    this.createHud()

    this.add
      .text(185, 350, 'Follow the biscuit trail!', {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#4a2b25',
        backgroundColor: '#fff4d6dd',
        padding: { x: 10, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.time.delayedCall(2600, () => {
      const hint = this.add
        .text(540, 315, 'Hot dogs give +1 life!', {
          fontFamily: '"Courier New", monospace',
          fontSize: '15px',
          color: '#4a2b25',
          backgroundColor: '#fff4d6dd',
          padding: { x: 9, y: 6 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
      this.tweens.add({ targets: hint, alpha: 0, delay: 3000, duration: 500, onComplete: () => hint.destroy() })
    })
  }

  update() {
    if (this.isComplete) {
      return
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown || controls.left
    const right = this.cursors.right.isDown || this.keys.right.isDown || controls.right
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      controls.jump

    if (left) {
      this.player.setAccelerationX(-1300)
      this.player.setFlipX(true)
    } else if (right) {
      this.player.setAccelerationX(1300)
      this.player.setFlipX(false)
    } else {
      this.player.setAccelerationX(0)
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (jumpPressed && body.blocked.down) {
      this.player.setVelocityY(-530)
      this.soundClick(380, 0.04)
    }
    controls.jump = false

    if (!body.blocked.down) {
      this.player.play('jump', true)
    } else if (Math.abs(body.velocity.x) > 30) {
      this.player.play('run', true)
    } else {
      this.player.play('idle', true)
    }

    if (this.player.y > GAME_HEIGHT + 30) {
      this.damagePlayer('pit')
    }

    this.enemies.children.iterate((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite
      if (!enemy.active) {
        return true
      }
      const minX = enemy.getData('minX') as number
      const maxX = enemy.getData('maxX') as number
      const speed = enemy.getData('speed') as number
      if (enemy.x <= minX) {
        enemy.setVelocityX(speed)
        enemy.setFlipX(false)
      } else if (enemy.x >= maxX) {
        enemy.setVelocityX(-speed)
        enemy.setFlipX(true)
      }
      return true
    })

    if (this.player.x > WORLD_WIDTH - 310) {
      this.completeLevel()
    } else if (this.player.x > 5900) {
      this.checkpointX = 5900
    } else if (this.player.x > 3950) {
      this.checkpointX = 3950
    } else if (this.player.x > 1950) {
      this.checkpointX = 1950
    }
  }

  private createBackground() {
    const far = this.add.graphics()
    far.fillStyle(0xd8f2fa)
    far.fillRect(0, 0, WORLD_WIDTH, GAME_HEIGHT)

    const hills = this.add.graphics()
    hills.fillStyle(0x9ac777)
    for (let x = 0; x < WORLD_WIDTH; x += 360) {
      hills.fillCircle(x + 130, 420, 190)
      hills.fillCircle(x + 330, 430, 145)
    }
    hills.setScrollFactor(0.2)

    const distantTrees = this.add.group()
    for (let x = 120; x < WORLD_WIDTH; x += 290) {
      const tree = this.add.image(x, 400, 'tree').setOrigin(0.5, 1).setScale(0.75)
      tree.setTint(x % 580 === 0 ? 0x9cc286 : 0x82b978)
      tree.setScrollFactor(0.45)
      distantTrees.add(tree)
    }

    for (let x = 180; x < WORLD_WIDTH; x += 620) {
      this.add.image(x, 95 + (x % 3) * 22, 'cloud').setScrollFactor(0.12).setAlpha(0.85)
    }
  }

  private createLevel() {
    this.platforms = this.physics.add.staticGroup()
    for (let x = 32; x < WORLD_WIDTH; x += 64) {
      const ground = this.platforms.create(x, GROUND_Y + 30, 'ground') as Phaser.Physics.Arcade.Image
      ground.refreshBody()
    }

    const gaps: Array<[number, number]> = [
      [1050, 1220],
      [2450, 2640],
      [4580, 4780],
      [6100, 6260],
    ]
    this.platforms.children.iterate((child) => {
      const platform = child as Phaser.Physics.Arcade.Image
      if (gaps.some(([start, end]) => platform.x > start && platform.x < end)) {
        platform.disableBody(true, true)
      }
      return true
    })

    const ledges: Array<[number, number, number]> = [
      [550, 365, 1],
      [800, 305, 1],
      [1100, 395, 1],
      [1260, 330, 1],
      [1510, 270, 2],
      [1880, 350, 1],
      [2180, 290, 1],
      [2510, 390, 1],
      [2710, 325, 1],
      [3050, 270, 2],
      [3480, 375, 1],
      [3770, 300, 1],
      [4080, 240, 2],
      [4630, 385, 1],
      [4860, 320, 1],
      [5210, 260, 2],
      [5660, 355, 1],
      [6130, 390, 1],
      [6340, 320, 1],
      [6620, 250, 2],
    ]
    ledges.forEach(([x, y, width]) => {
      for (let i = 0; i < width; i += 1) {
        const platform = this.platforms.create(x + i * 92, y, 'platform') as Phaser.Physics.Arcade.Image
        platform.refreshBody()
      }
    })

    const biscuitPositions: Array<[number, number]> = [
      [310, 420], [430, 420], [550, 315], [800, 255], [970, 410],
      [1110, 340], [1260, 280], [1510, 220], [1600, 220], [1800, 410],
      [1880, 300], [2180, 240], [2360, 410], [2520, 340], [2710, 275],
      [3050, 220], [3140, 220], [3370, 410], [3480, 325], [3770, 250],
      [4080, 190], [4170, 190], [4440, 410], [4640, 335], [4860, 270],
      [5210, 210], [5300, 210], [5530, 410], [5660, 305], [5900, 410],
      [6140, 340], [6340, 270], [6620, 200], [6710, 200], [6920, 410],
    ]
    this.biscuits = this.physics.add.group({ allowGravity: false, immovable: true })
    biscuitPositions.forEach(([x, y], index) => {
      const biscuit = this.biscuits.create(x, y, 'biscuit') as Phaser.Physics.Arcade.Image
      biscuit.setData('index', index)
      this.tweens.add({
        targets: biscuit,
        y: y - 8,
        angle: index % 2 ? -7 : 7,
        duration: 650 + (index % 3) * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })
    gameState.totalBiscuits = biscuitPositions.length

    this.hotdogs = this.physics.add.group({ allowGravity: false, immovable: true })
    ;[
      [1585, 195],
      [4125, 165],
      [6665, 175],
    ].forEach(([x, y]) => {
      const hotdog = this.hotdogs.create(x, y, 'hotdog') as Phaser.Physics.Arcade.Image
      this.tweens.add({ targets: hotdog, scale: 1.12, duration: 500, yoyo: true, repeat: -1 })
    })

    this.enemies = this.physics.add.group()
    this.addEnemy('raccoon', 720, 415, 610, 930, 75)
    this.addEnemy('bee', 1360, 230, 1230, 1680, 95, false)
    this.addEnemy('raccoon', 2050, 415, 1910, 2300, 90)
    this.addEnemy('bee', 2900, 205, 2670, 3260, 105, false)
    this.addEnemy('raccoon', 3590, 415, 3420, 3900, 95)
    this.addEnemy('bee', 4380, 185, 4020, 4510, 110, false)
    this.addEnemy('raccoon', 5430, 415, 5290, 5790, 105)
    this.addEnemy('bee', 6460, 185, 6250, 6790, 120, false)

    this.add.image(WORLD_WIDTH - 170, 408, 'doghouse').setOrigin(0.5, 1)
    this.add
      .text(WORLD_WIDTH - 170, 315, 'HOME!', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#fff4d6',
        backgroundColor: '#70412f',
        padding: { x: 8, y: 5 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    for (let x = 180; x < WORLD_WIDTH; x += 430) {
      this.add.image(x, 454, 'flower').setOrigin(0.5, 1).setFlipX(x % 2 === 0)
    }
  }

  private addEnemy(
    texture: string,
    x: number,
    y: number,
    minX: number,
    maxX: number,
    speed: number,
    gravity = true,
  ) {
    const enemy = this.enemies.create(x, y, texture) as Phaser.Physics.Arcade.Sprite
    enemy.setData({ minX, maxX, speed })
    enemy.setVelocityX(speed)
    enemy.setImmovable(true)
    ;(enemy.body as Phaser.Physics.Arcade.Body).setAllowGravity(gravity)
    enemy.setSize(texture === 'bee' ? 28 : 38, texture === 'bee' ? 20 : 34)
    if (!gravity) {
      this.tweens.add({ targets: enemy, y: y + 28, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
  }

  private createAnimations() {
    if (this.anims.exists('run')) {
      return
    }
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'choco-idle' }],
      frameRate: 1,
    })
    this.anims.create({
      key: 'run',
      frames: [{ key: 'choco-run-1' }, { key: 'choco-run-2' }],
      frameRate: 8,
      repeat: -1,
    })
    this.anims.create({
      key: 'jump',
      frames: [{ key: 'choco-jump' }],
      frameRate: 1,
    })
  }

  private createHud() {
    const panel = this.add.rectangle(18, 18, 365, 64, 0x2d201d, 0.82).setOrigin(0).setScrollFactor(0)
    panel.setStrokeStyle(3, 0xffe7ab, 1)
    this.add.image(45, 50, 'biscuit').setScrollFactor(0).setScale(1.15)
    this.biscuitText = this.add
      .text(70, 38, `0 / ${gameState.totalBiscuits}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '23px',
        color: '#fff4d6',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)

    this.add
      .text(205, 39, 'LIVES', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#fff4d6',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)

    this.add
      .text(940, 24, gameState.mode === 'casual' ? 'CASUAL · NO DAMAGE' : 'NORMAL', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: gameState.mode === 'casual' ? '#4a2b25' : '#fff4d6',
        backgroundColor: gameState.mode === 'casual' ? '#fff4d6' : '#784536',
        padding: { x: 10, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)

    this.livesGroup = this.add.group()
    this.updateLivesHud()
  }

  private updateLivesHud() {
    this.livesGroup.clear(true, true)
    for (let i = 0; i < gameState.lives; i += 1) {
      const heart = this.add.image(285 + i * 31, 50, 'heart').setScale(0.8).setScrollFactor(0)
      this.livesGroup.add(heart)
    }
  }

  private collectBiscuit(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    item:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
  ) {
    const biscuit = item as Phaser.Physics.Arcade.Image
    if (!biscuit.active) {
      return
    }
    gameState.biscuits += 1
    this.biscuitText.setText(`${gameState.biscuits} / ${gameState.totalBiscuits}`)
    this.sparkle(biscuit.x, biscuit.y, 0xf5ca52)
    this.soundClick(700, 0.035)
    biscuit.disableBody(true, true)
  }

  private collectHotdog(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    item:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
  ) {
    const hotdog = item as Phaser.Physics.Arcade.Image
    if (!hotdog.active) {
      return
    }
    gameState.lives = Math.min(5, gameState.lives + 1)
    this.updateLivesHud()
    this.sparkle(hotdog.x, hotdog.y, 0xff7f5b)
    this.showFloatingText(hotdog.x, hotdog.y - 20, '+1 LIFE!', '#fff4d6')
    this.soundClick(930, 0.07)
    hotdog.disableBody(true, true)
  }

  private hitEnemy(
    _player:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    enemyObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
  ) {
    if (this.isInvulnerable || this.isComplete) {
      return
    }
    const enemy = enemyObject as Phaser.Physics.Arcade.Sprite
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (body.velocity.y > 120 && this.player.y < enemy.y - 12) {
      enemy.disableBody(true, true)
      this.player.setVelocityY(-330)
      this.sparkle(enemy.x, enemy.y, 0xffffff)
      this.showFloatingText(enemy.x, enemy.y - 25, 'BOOP!', '#ffffff')
      this.soundClick(260, 0.05)
      return
    }
    this.damagePlayer('enemy', enemy.x)
  }

  private damagePlayer(source: 'enemy' | 'pit', enemyX?: number) {
    if (this.isInvulnerable || this.isComplete) {
      return
    }

    if (gameState.mode === 'casual') {
      this.applyCasualKnockback(source, enemyX)
      return
    }

    gameState.lives -= 1
    this.updateLivesHud()
    this.cameras.main.shake(220, 0.012)
    this.soundClick(120, 0.12)

    if (gameState.lives <= 0) {
      gameState.status = 'game-over'
      this.isComplete = true
      this.physics.pause()
      this.showEndCard(false)
      return
    }

    this.isInvulnerable = true
    this.player.setPosition(this.checkpointX, 390)
    this.player.setVelocity(0, 0)
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 110,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.player.setAlpha(1)
        this.isInvulnerable = false
      },
    })
  }

  private applyCasualKnockback(source: 'enemy' | 'pit', enemyX?: number) {
    this.isInvulnerable = true
    this.cameras.main.shake(120, 0.006)
    this.soundClick(170, 0.06)

    if (source === 'pit') {
      this.player.setPosition(this.checkpointX, 390)
      this.player.setVelocity(0, -180)
      this.showFloatingText(this.checkpointX, 350, 'WHEW!', '#fff4d6')
    } else {
      const direction = this.player.x < (enemyX ?? this.player.x) ? -1 : 1
      this.player.setVelocity(direction * 390, -290)
      this.showFloatingText(this.player.x, this.player.y - 35, 'BONK!', '#fff4d6')
    }

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 90,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.player.setAlpha(1)
        this.isInvulnerable = false
      },
    })
  }

  private sparkle(x: number, y: number, tint: number) {
    for (let i = 0; i < 8; i += 1) {
      const spark = this.add.image(x, y, 'spark').setTint(tint).setScale(0.55)
      const angle = (Math.PI * 2 * i) / 8
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 48,
        y: y + Math.sin(angle) * 48,
        alpha: 0,
        scale: 0,
        duration: 430,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      })
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const label = this.add
      .text(x, y, text, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color,
        stroke: '#3a241f',
        strokeThickness: 5,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    this.tweens.add({
      targets: label,
      y: y - 55,
      alpha: 0,
      duration: 850,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    })
  }

  private completeLevel() {
    if (this.isComplete) {
      return
    }
    this.isComplete = true
    gameState.status = 'won'
    this.player.setAccelerationX(0)
    this.player.setVelocityX(0)
    this.player.play('idle')
    this.cameras.main.flash(500, 255, 244, 214)
    this.time.delayedCall(500, () => this.showEndCard(true))
  }

  private showEndCard(won: boolean) {
    const camera = this.cameras.main
    const x = camera.scrollX + GAME_WIDTH / 2
    const title = won ? 'TAIL-WAGGING VICTORY!' : 'OH, BISCUITS!'
    const subtitle = won
      ? `Choco brought home ${gameState.biscuits} of ${gameState.totalBiscuits} biscuits.`
      : 'Choco needs another try.'

    this.add.rectangle(x, 270, 630, 300, 0x2d201d, 0.93).setStrokeStyle(5, 0xffe7ab)
    this.add
      .text(x, 205, title, {
        fontFamily: '"Courier New", monospace',
        fontSize: '34px',
        color: '#fff4d6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    this.add
      .text(x, 270, subtitle, {
        fontFamily: '"Courier New", monospace',
        fontSize: '19px',
        color: '#ffd47c',
        align: 'center',
        wordWrap: { width: 520 },
      })
      .setOrigin(0.5)
    const retry = this.add
      .text(x, 350, 'PRESS SPACE OR TAP TO PLAY AGAIN', {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#4a2b25',
        backgroundColor: '#fff4d6',
        padding: { x: 14, y: 10 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const restart = () => this.scene.restart()
    retry.on('pointerdown', restart)
    this.input.keyboard?.once('keydown-SPACE', restart)
  }

  private soundClick(frequency: number, volume: number) {
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) {
      return
    }
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.setValueAtTime(frequency, context.currentTime)
    oscillator.type = 'square'
    gain.gain.setValueAtTime(volume, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.08)
    oscillator.addEventListener('ended', () => void context.close())
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="game-shell">
    <header class="game-header">
      <div>
        <p class="eyebrow">A chibi pixel adventure</p>
        <h1>Choco's Biscuit Quest</h1>
      </div>
      <div class="legend" aria-label="Collectible guide">
        <span><b class="biscuit-dot"></b> Biscuits</span>
        <span><b class="hotdog-dot"></b> Hot dogs = extra lives</span>
        <button id="music-control" type="button" aria-pressed="true">MUSIC: ON</button>
      </div>
    </header>
    <section class="game-frame" aria-label="Choco's Biscuit Quest game">
      <div id="game"></div>
      <div class="touch-controls" aria-label="Touch controls">
        <button id="left-control" type="button" aria-label="Move left">◀</button>
        <button id="jump-control" type="button" aria-label="Jump">▲</button>
        <button id="right-control" type="button" aria-label="Move right">▶</button>
      </div>
    </section>
    <footer>
      <span><kbd>A</kbd><kbd>D</kbd> or <kbd>←</kbd><kbd>→</kbd> to run</span>
      <span><kbd>W</kbd>, <kbd>↑</kbd>, or <kbd>Space</kbd> to jump</span>
      <span>Jump on critters to boop them away</span>
    </footer>
  </main>
`

const bindHoldControl = (id: string, key: 'left' | 'right') => {
  const button = document.querySelector<HTMLButtonElement>(id)!
  const setPressed = (pressed: boolean) => {
    controls[key] = pressed
    button.classList.toggle('is-pressed', pressed)
  }
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    button.setPointerCapture(event.pointerId)
    setPressed(true)
  })
  button.addEventListener('pointerup', () => setPressed(false))
  button.addEventListener('pointercancel', () => setPressed(false))
  button.addEventListener('pointerleave', () => setPressed(false))
}

bindHoldControl('#left-control', 'left')
bindHoldControl('#right-control', 'right')
document.querySelector<HTMLButtonElement>('#jump-control')!.addEventListener('pointerdown', (event) => {
  event.preventDefault()
  controls.jump = true
})

const musicControl = document.querySelector<HTMLButtonElement>('#music-control')!
musicControl.addEventListener('click', async () => {
  const enabled = await meadowMusic.toggle()
  musicControl.textContent = enabled ? 'MUSIC: ON' : 'MUSIC: OFF'
  musicControl.setAttribute('aria-pressed', enabled.toString())
})

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#88cfed',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1150 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitleScene, GameScene],
}

window.chocoGame = new Phaser.Game(config)
