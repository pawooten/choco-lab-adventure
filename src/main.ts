import Phaser from 'phaser'
import './style.css'

type GameStatus = 'title' | 'playing' | 'won' | 'game-over'
type GameMode = 'normal' | 'casual'
type EnemyConfig = [texture: string, x: number, y: number, minX: number, maxX: number, speed: number, gravity?: boolean]
type LedgeConfig = [x: number, y: number, width: number]

type LevelConfig = {
  name: string
  subtitle: string
  theme: 'meadow' | 'beach' | 'factory' | 'mansion' | 'bowling' | 'vet'
  skyColor: number
  groundTint: number
  platformTint: number
  gaps: Array<[number, number]>
  ledges: LedgeConfig[]
  enemies: EnemyConfig[]
  goalLabel: string
}

declare global {
  interface Window {
    chocoGame: Phaser.Game
    chocoGameState: {
      status: GameStatus
      biscuits: number
      totalBiscuits: number
      lives: number
      mode: GameMode
      paused: boolean
      level: number
      levelName: string
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
  paused: false,
  level: 0,
  levelName: 'Sunny Meadow',
}

window.chocoGameState = gameState

const LEVELS: LevelConfig[] = [
  {
    name: 'Sunny Meadow',
    subtitle: 'The biscuit trail begins!',
    theme: 'meadow',
    skyColor: 0x88cfed,
    groundTint: 0xffffff,
    platformTint: 0xffffff,
    gaps: [[1050, 1220], [2450, 2640], [4580, 4780], [6100, 6260]],
    ledges: [
      [550, 365, 1], [800, 305, 1], [1100, 395, 1], [1260, 330, 1], [1510, 270, 2],
      [1880, 350, 1], [2180, 290, 1], [2510, 390, 1], [2710, 325, 1], [3050, 270, 2],
      [3480, 375, 1], [3770, 300, 1], [4080, 240, 2], [4630, 385, 1], [4860, 320, 1],
      [5210, 260, 2], [5660, 355, 1], [6130, 390, 1], [6340, 320, 1], [6620, 250, 2],
    ],
    enemies: [
      ['raccoon', 720, 415, 610, 930, 75], ['bee', 1360, 230, 1230, 1680, 95, false],
      ['raccoon', 2050, 415, 1910, 2300, 90], ['bee', 2900, 205, 2670, 3260, 105, false],
      ['raccoon', 3590, 415, 3420, 3900, 95], ['bee', 4380, 185, 4020, 4510, 110, false],
      ['raccoon', 5430, 415, 5290, 5790, 105], ['bee', 6460, 185, 6250, 6790, 120, false],
    ],
    goalLabel: 'HOME!',
  },
  {
    name: 'Biscuit Bay',
    subtitle: 'Surf, sand, and sneaky crabs',
    theme: 'beach',
    skyColor: 0x63c9ef,
    groundTint: 0xffdda0,
    platformTint: 0xeec777,
    gaps: [[900, 1120], [2060, 2290], [3660, 3890], [5250, 5510], [6400, 6580]],
    ledges: [
      [430, 360, 1], [710, 300, 2], [1010, 390, 1], [1230, 325, 1], [1510, 260, 1],
      [1800, 340, 2], [2160, 390, 1], [2430, 310, 1], [2780, 245, 2], [3190, 350, 1],
      [3540, 285, 1], [3750, 390, 1], [4060, 315, 2], [4510, 250, 1], [4930, 350, 2],
      [5380, 390, 1], [5650, 310, 1], [5980, 245, 2], [6460, 360, 1], [6750, 285, 1],
    ],
    enemies: [
      ['crab', 650, 425, 500, 850, 90], ['seagull', 1440, 220, 1170, 1720, 110, false],
      ['crab', 2640, 425, 2380, 3200, 105], ['seagull', 3410, 210, 3050, 3600, 120, false],
      ['crab', 4760, 425, 4460, 5170, 115], ['seagull', 5830, 190, 5550, 6220, 130, false],
      ['crab', 6810, 425, 6630, 7000, 125],
    ],
    goalLabel: 'BOARDWALK!',
  },
  {
    name: 'Hot Dog Factory',
    subtitle: 'Conveyors, condiments, and runaway snacks',
    theme: 'factory',
    skyColor: 0x7f8794,
    groundTint: 0x9c9389,
    platformTint: 0xd97849,
    gaps: [[820, 1040], [1840, 2060], [3280, 3520], [4700, 4970], [6040, 6260]],
    ledges: [
      [390, 350, 2], [760, 285, 1], [950, 390, 1], [1190, 315, 2], [1580, 245, 1],
      [1920, 390, 1], [2190, 325, 2], [2600, 260, 1], [2960, 345, 2], [3390, 390, 1],
      [3650, 300, 1], [3970, 235, 2], [4410, 340, 1], [4830, 390, 1], [5100, 300, 2],
      [5520, 235, 1], [5880, 345, 2], [6150, 390, 1], [6460, 300, 1], [6760, 235, 2],
    ],
    enemies: [
      ['sausage-bot', 620, 420, 480, 790, 100], ['mustard-drone', 1460, 205, 1100, 1760, 120, false],
      ['sausage-bot', 2440, 420, 2110, 3150, 115], ['mustard-drone', 3780, 190, 3550, 4300, 130, false],
      ['sausage-bot', 5310, 420, 5010, 5900, 125], ['mustard-drone', 6540, 190, 6300, 6900, 140, false],
    ],
    goalLabel: 'SHIPPING!',
  },
  {
    name: 'Howling Hall',
    subtitle: 'A haunted mansion full of friendly frights',
    theme: 'mansion',
    skyColor: 0x17162c,
    groundTint: 0x65526e,
    platformTint: 0x755b78,
    gaps: [[980, 1190], [2310, 2540], [3850, 4080], [5020, 5270], [6280, 6490]],
    ledges: [
      [470, 355, 1], [720, 290, 1], [1040, 390, 1], [1320, 315, 2], [1710, 245, 1],
      [2100, 340, 1], [2420, 390, 1], [2700, 305, 2], [3130, 235, 1], [3500, 345, 1],
      [3970, 390, 1], [4270, 300, 2], [4660, 230, 1], [5150, 390, 1], [5440, 315, 1],
      [5740, 245, 2], [6170, 345, 1], [6400, 390, 1], [6700, 300, 2],
    ],
    enemies: [
      ['ghost', 690, 230, 430, 930, 95, false], ['spider', 1570, 420, 1220, 2200, 105],
      ['ghost', 2900, 190, 2600, 3400, 115, false], ['spider', 3670, 420, 3450, 3810, 115],
      ['ghost', 4530, 180, 4150, 4920, 125, false], ['spider', 5600, 420, 5310, 6160, 125],
      ['ghost', 6750, 190, 6520, 7040, 135, false],
    ],
    goalLabel: 'FRONT DOOR!',
  },
  {
    name: 'Cosmic Bowling',
    subtitle: 'Neon lanes and rolling trouble',
    theme: 'bowling',
    skyColor: 0x120d2a,
    groundTint: 0x514287,
    platformTint: 0xe65ccc,
    gaps: [[740, 940], [1730, 1960], [3010, 3240], [4380, 4630], [5800, 6050]],
    ledges: [
      [370, 360, 1], [620, 290, 1], [820, 390, 1], [1090, 315, 2], [1450, 245, 1],
      [1830, 390, 1], [2110, 325, 1], [2450, 255, 2], [2870, 350, 1], [3130, 390, 1],
      [3440, 300, 2], [3870, 230, 1], [4260, 345, 1], [4500, 390, 1], [4820, 305, 2],
      [5240, 235, 1], [5650, 345, 1], [5940, 390, 1], [6260, 300, 2], [6720, 235, 1],
    ],
    enemies: [
      ['bowling-ball', 560, 424, 370, 700, 125], ['cosmic-pin', 1370, 405, 1020, 1640, 105],
      ['bowling-ball', 2700, 424, 2040, 2940, 145], ['cosmic-pin', 3660, 405, 3350, 4180, 120],
      ['bowling-ball', 5200, 424, 4720, 5680, 155], ['cosmic-pin', 6500, 405, 6150, 7000, 135],
    ],
    goalLabel: 'ARCADE EXIT!',
  },
  {
    name: 'Escape from the Vet',
    subtitle: 'The final dash to freedom!',
    theme: 'vet',
    skyColor: 0xc8eef0,
    groundTint: 0xc9dce0,
    platformTint: 0x78b9b4,
    gaps: [[860, 1080], [2140, 2380], [3480, 3740], [4870, 5130], [6230, 6460]],
    ledges: [
      [420, 350, 1], [690, 280, 2], [960, 390, 1], [1220, 310, 1], [1510, 235, 2],
      [1970, 340, 1], [2260, 390, 1], [2550, 300, 2], [2990, 225, 1], [3360, 345, 1],
      [3620, 390, 1], [3970, 295, 2], [4410, 220, 1], [5000, 390, 1], [5320, 310, 2],
      [5750, 235, 1], [6150, 345, 1], [6360, 390, 1], [6670, 285, 2],
    ],
    enemies: [
      ['robo-vac', 620, 420, 380, 820, 115], ['vet-cone', 1430, 410, 1150, 1900, 105],
      ['robo-vac', 2780, 420, 2460, 3310, 135], ['vet-cone', 4210, 410, 3850, 4700, 120],
      ['robo-vac', 5540, 420, 5220, 6100, 145], ['vet-cone', 6810, 410, 6530, 7040, 135],
    ],
    goalLabel: 'FREEDOM!',
  },
]

class MeadowMusic {
  private context: AudioContext | undefined
  private masterGain: GainNode | undefined
  private backgroundGain: GainNode | undefined
  private nextStepTime = 0
  private step = 0
  private enabled = true
  private gamePaused = false
  private gameOverUntil = 0
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
      this.backgroundGain = this.context.createGain()
      this.masterGain.gain.value = this.enabled ? 0.13 : 0
      this.backgroundGain.gain.value = 1
      this.backgroundGain.connect(this.masterGain)
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
    if (this.enabled && !this.gamePaused) {
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

  isGameOverTunePlaying() {
    return Boolean(this.context && this.context.currentTime < this.gameOverUntil)
  }

  async pauseForGame() {
    this.gamePaused = true
    if (this.context?.state === 'running') {
      await this.context.suspend()
    }
  }

  async resumeFromGamePause() {
    this.gamePaused = false
    if (this.enabled) {
      await this.start()
    }
  }

  resumeBackground() {
    if (!this.context || !this.backgroundGain) {
      return
    }
    this.gameOverUntil = 0
    const now = this.context.currentTime
    this.backgroundGain.gain.cancelScheduledValues(now)
    this.backgroundGain.gain.setValueAtTime(this.backgroundGain.gain.value, now)
    this.backgroundGain.gain.linearRampToValueAtTime(1, now + 0.18)
  }

  async playGameOverTune() {
    if (!this.enabled) {
      return
    }
    await this.start()
    if (!this.context || !this.masterGain || !this.backgroundGain) {
      return
    }

    const now = this.context.currentTime
    this.backgroundGain.gain.cancelScheduledValues(now)
    this.backgroundGain.gain.setValueAtTime(this.backgroundGain.gain.value, now)
    this.backgroundGain.gain.linearRampToValueAtTime(0, now + 0.16)

    const cueGain = this.context.createGain()
    cueGain.gain.value = 1
    cueGain.connect(this.masterGain)

    const notes: Array<[number, number, number]> = [
      [72, 0.08, 0.28],
      [67, 0.38, 0.28],
      [64, 0.68, 0.34],
      [60, 1.05, 0.5],
      [59, 1.62, 0.2],
      [60, 1.86, 0.78],
    ]
    notes.forEach(([note, offset, duration]) => {
      this.scheduleCueTone(note, now + offset, duration, 'square', 0.42, cueGain)
      this.scheduleCueTone(note - 12, now + offset, duration * 1.05, 'triangle', 0.23, cueGain)
    })

    this.gameOverUntil = now + 2.75
    window.setTimeout(() => cueGain.disconnect(), 3000)
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
    if (!this.context || !this.backgroundGain) {
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
    envelope.connect(this.backgroundGain)
    oscillator.start(time)
    oscillator.stop(time + duration + 0.02)
  }

  private scheduleKick(time: number) {
    if (!this.context || !this.backgroundGain) {
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
    envelope.connect(this.backgroundGain)
    oscillator.start(time)
    oscillator.stop(time + 0.15)
  }

  private scheduleTick(time: number) {
    if (!this.context || !this.backgroundGain) {
      return
    }
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(1550, time)
    envelope.gain.setValueAtTime(0.025, time)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.035)
    oscillator.connect(envelope)
    envelope.connect(this.backgroundGain)
    oscillator.start(time)
    oscillator.stop(time + 0.04)
  }

  private scheduleCueTone(
    midiNote: number,
    time: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    output: AudioNode,
  ) {
    if (!this.context) {
      return
    }
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(440 * 2 ** ((midiNote - 69) / 12), time)
    envelope.gain.setValueAtTime(0.001, time)
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.02)
    envelope.gain.exponentialRampToValueAtTime(0.001, time + duration)
    oscillator.connect(envelope)
    envelope.connect(output)
    oscillator.start(time)
    oscillator.stop(time + duration + 0.02)
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

  pixelTexture(scene, 'crab', 44, 30, [
    [outline, 9, 9, 27, 17], [0xe76549, 11, 10, 23, 15],
    [outline, 12, 5, 7, 8], [outline, 27, 5, 7, 8],
    [cream, 14, 6, 3, 3], [cream, 29, 6, 3, 3],
    [outline, 0, 10, 12, 5], [outline, 34, 10, 10, 5],
    [0xe76549, 1, 7, 8, 8], [0xe76549, 36, 7, 7, 8],
    [outline, 5, 24, 10, 4], [outline, 29, 24, 10, 4],
  ])

  pixelTexture(scene, 'seagull', 46, 28, [
    [0xffffff, 4, 8, 37, 12], [0xd6e7ec, 0, 3, 19, 8], [0xd6e7ec, 27, 3, 19, 8],
    [outline, 31, 10, 5, 5], [0xf3b547, 39, 12, 7, 4], [0x82939e, 17, 17, 15, 7],
  ])

  pixelTexture(scene, 'sausage-bot', 50, 36, [
    [outline, 5, 8, 40, 21], [0xc94d38, 7, 10, 36, 17],
    [0xe9a35c, 2, 12, 8, 13], [0xe9a35c, 40, 12, 8, 13],
    [0xf5d84e, 12, 13, 5, 3], [0xf5d84e, 20, 17, 5, 3], [0xf5d84e, 29, 13, 5, 3],
    [outline, 12, 28, 7, 7], [outline, 31, 28, 7, 7],
  ])

  pixelTexture(scene, 'mustard-drone', 42, 30, [
    [outline, 6, 8, 30, 18], [0xf2c94c, 8, 10, 26, 14],
    [0x8cd4dc, 0, 2, 15, 8], [0x8cd4dc, 27, 2, 15, 8],
    [outline, 13, 13, 4, 4], [outline, 26, 13, 4, 4], [0xc94d38, 18, 19, 8, 3],
  ])

  pixelTexture(scene, 'ghost', 42, 44, [
    [0x27213e, 4, 3, 34, 39], [0xe8e5ff, 7, 4, 28, 32],
    [0xcfc9ef, 7, 26, 7, 14], [0xe8e5ff, 14, 29, 7, 13],
    [0xcfc9ef, 21, 27, 7, 15], [0xe8e5ff, 28, 29, 7, 13],
    [outline, 12, 15, 5, 7], [outline, 26, 15, 5, 7], [0x796b99, 18, 25, 7, 4],
  ])

  pixelTexture(scene, 'spider', 42, 30, [
    [outline, 9, 7, 24, 19], [0x503f67, 12, 9, 18, 15],
    [0xf178a7, 17, 12, 8, 6], [cream, 14, 10, 3, 3], [cream, 26, 10, 3, 3],
    [outline, 0, 5, 12, 4], [outline, 30, 5, 12, 4],
    [outline, 0, 15, 12, 4], [outline, 30, 15, 12, 4],
    [outline, 3, 25, 12, 4], [outline, 27, 25, 12, 4],
  ])

  pixelTexture(scene, 'bowling-ball', 38, 38, [
    [outline, 2, 2, 34, 34], [0x784db5, 5, 5, 28, 28],
    [0xe65ccc, 9, 8, 8, 6], [0x1e1838, 14, 12, 5, 5],
    [0x1e1838, 22, 9, 5, 5], [0x1e1838, 23, 18, 5, 5],
  ])

  pixelTexture(scene, 'cosmic-pin', 34, 46, [
    [outline, 8, 1, 18, 43], [0xffffff, 11, 3, 12, 38],
    [0xf05da9, 9, 13, 16, 7], [0x8a63e8, 10, 20, 14, 4],
    [outline, 13, 28, 3, 4], [outline, 20, 28, 3, 4],
  ])

  pixelTexture(scene, 'robo-vac', 50, 32, [
    [outline, 3, 8, 44, 20], [0x5aa6a7, 6, 10, 38, 16],
    [0xc5f1ee, 10, 5, 20, 8], [outline, 14, 13, 5, 5], [outline, 31, 13, 5, 5],
    [0xef6a66, 38, 11, 5, 5], [outline, 9, 27, 9, 5], [outline, 33, 27, 9, 5],
  ])

  pixelTexture(scene, 'vet-cone', 40, 42, [
    [outline, 4, 4, 32, 34], [0xf4eee2, 8, 7, 24, 27],
    [0x68b7b2, 10, 11, 20, 5], [outline, 13, 19, 4, 5], [outline, 24, 19, 4, 5],
    [0xe68b81, 17, 27, 8, 4], [outline, 1, 35, 38, 6],
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

  pixelTexture(scene, 'exit-door', 82, 110, [
    [outline, 3, 3, 76, 107], [0x784536, 8, 8, 66, 97],
    [0xf8d77e, 17, 16, 48, 22], [outline, 25, 22, 32, 10],
    [0xfff4d6, 30, 24, 22, 6], [0xe9b653, 61, 57, 7, 7],
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
    gameState.levelName = LEVELS[0].name
    this.cameras.main.setBackgroundColor('#82c8e8')
    if (!this.textures.exists('choco-idle')) {
      createPixelArt(this)
    }

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
        gameState.level = 0
        gameState.lives = 3
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
  private isPaused = false
  private pauseButton!: Phaser.GameObjects.Text
  private pauseOverlay!: Phaser.GameObjects.Container
  private level!: LevelConfig

  constructor() {
    super('GameScene')
  }

  create() {
    this.level = LEVELS[gameState.level]
    gameState.status = 'playing'
    gameState.biscuits = 0
    gameState.levelName = this.level.name
    gameState.paused = false
    this.isPaused = false
    this.isComplete = false
    this.isInvulnerable = false
    this.checkpointX = 120
    this.physics.resume()
    meadowMusic.resumeBackground()
    controls.left = false
    controls.right = false
    controls.jump = false

    if (!this.textures.exists('choco-idle')) {
      createPixelArt(this)
    }

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.physics.world.setBoundsCollision(true, true, true, false)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBackgroundColor(this.level.skyColor)

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
    this.createPauseUi()
    this.showLevelIntro()

    this.add
      .text(215, 350, this.level.subtitle, {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#4a2b25',
        backgroundColor: '#fff4d6dd',
        padding: { x: 10, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    if (gameState.level === 0) {
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

    this.input.keyboard?.on('keydown-P', this.togglePause, this)
    this.input.keyboard?.on('keydown-ESC', this.togglePause, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-P', this.togglePause, this)
      this.input.keyboard?.off('keydown-ESC', this.togglePause, this)
    })
  }

  update() {
    if (this.isComplete || this.isPaused) {
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
    far.fillStyle(this.level.skyColor)
    far.fillRect(0, 0, WORLD_WIDTH, GAME_HEIGHT)

    const scenery = this.add.graphics().setScrollFactor(0.25)
    switch (this.level.theme) {
      case 'meadow':
        scenery.fillStyle(0x9ac777)
        for (let x = 0; x < WORLD_WIDTH; x += 360) {
          scenery.fillCircle(x + 130, 420, 190)
          scenery.fillCircle(x + 330, 430, 145)
        }
        for (let x = 120; x < WORLD_WIDTH; x += 290) {
          this.add.image(x, 400, 'tree').setOrigin(0.5, 1).setScale(0.75).setTint(0x82b978).setScrollFactor(0.45)
        }
        for (let x = 180; x < WORLD_WIDTH; x += 620) {
          this.add.image(x, 95 + (x % 3) * 22, 'cloud').setScrollFactor(0.12).setAlpha(0.85)
        }
        break
      case 'beach':
        scenery.fillStyle(0xffd36b)
        scenery.fillCircle(640, 100, 56)
        scenery.fillStyle(0x269ed0)
        scenery.fillRect(0, 305, WORLD_WIDTH, 170)
        scenery.lineStyle(5, 0x91e3ef, 1)
        for (let x = 0; x < WORLD_WIDTH; x += 120) {
          scenery.strokeLineShape(new Phaser.Geom.Line(x, 340 + (x % 240 ? 12 : 0), x + 70, 340))
        }
        for (let x = 300; x < WORLD_WIDTH; x += 720) {
          scenery.fillStyle(0xd95757)
          scenery.fillTriangle(x, 395, x + 70, 320, x + 140, 395)
          scenery.lineStyle(8, 0x68442d)
          scenery.lineBetween(x + 70, 320, x + 70, 455)
        }
        break
      case 'factory':
        scenery.fillStyle(0x59616d)
        scenery.fillRect(0, 90, WORLD_WIDTH, 390)
        scenery.lineStyle(5, 0x424853)
        for (let x = 0; x < WORLD_WIDTH; x += 220) {
          scenery.strokeRect(x + 20, 120, 170, 120)
          scenery.lineBetween(x + 105, 120, x + 105, 240)
          scenery.lineBetween(x + 20, 180, x + 190, 180)
        }
        scenery.lineStyle(18, 0xcf7151)
        scenery.lineBetween(0, 285, WORLD_WIDTH, 285)
        scenery.lineStyle(6, 0xf2bd53)
        scenery.lineBetween(0, 285, WORLD_WIDTH, 285)
        break
      case 'mansion':
        scenery.fillStyle(0xd6d3f4)
        scenery.fillCircle(710, 100, 62)
        scenery.fillStyle(0x29233f)
        scenery.fillRect(0, 130, WORLD_WIDTH, 350)
        for (let x = 80; x < WORLD_WIDTH; x += 260) {
          scenery.fillStyle(0x514463)
          scenery.fillRect(x, 170, 180, 260)
          scenery.fillStyle(0xc7a452)
          scenery.fillRect(x + 35, 215, 42, 65)
          scenery.fillRect(x + 105, 215, 42, 65)
          scenery.lineStyle(6, 0x2a2238)
          scenery.strokeRect(x + 35, 215, 42, 65)
          scenery.strokeRect(x + 105, 215, 42, 65)
        }
        break
      case 'bowling':
        scenery.fillStyle(0x211548)
        scenery.fillRect(0, 0, WORLD_WIDTH, GAME_HEIGHT)
        for (let x = 40; x < WORLD_WIDTH; x += 190) {
          scenery.fillStyle(x % 380 ? 0x55d9e8 : 0xf05da9)
          scenery.fillCircle(x, 90 + (x % 5) * 25, 5)
        }
        scenery.lineStyle(8, 0x713f91)
        for (let x = 0; x < WORLD_WIDTH; x += 240) {
          scenery.lineBetween(x, 360, x + 190, 360)
          scenery.lineBetween(x + 20, 410, x + 210, 410)
        }
        scenery.lineStyle(3, 0x38d9d2, 0.8)
        scenery.lineBetween(0, 280, WORLD_WIDTH, 280)
        break
      case 'vet':
        scenery.fillStyle(0xe7f5f3)
        scenery.fillRect(0, 0, WORLD_WIDTH, GAME_HEIGHT)
        scenery.lineStyle(3, 0xb4d9d7)
        for (let x = 0; x < WORLD_WIDTH; x += 80) {
          scenery.lineBetween(x, 0, x, 480)
        }
        for (let y = 80; y < 480; y += 80) {
          scenery.lineBetween(0, y, WORLD_WIDTH, y)
        }
        for (let x = 180; x < WORLD_WIDTH; x += 560) {
          scenery.fillStyle(0x6baaa7)
          scenery.fillRect(x, 160, 260, 170)
          scenery.fillStyle(0xc9ece8)
          scenery.fillRect(x + 15, 175, 105, 58)
          scenery.fillRect(x + 140, 175, 105, 58)
          scenery.fillStyle(0xed8f83)
          scenery.fillCircle(x + 130, 125, 28)
          scenery.fillRect(x + 122, 87, 16, 76)
          scenery.fillRect(x + 92, 117, 76, 16)
        }
        break
    }
  }

  private createLevel() {
    this.platforms = this.physics.add.staticGroup()
    for (let x = 32; x < WORLD_WIDTH; x += 64) {
      const ground = this.platforms.create(x, GROUND_Y + 30, 'ground') as Phaser.Physics.Arcade.Image
      ground.setTint(this.level.groundTint)
      ground.refreshBody()
    }

    this.platforms.children.iterate((child) => {
      const platform = child as Phaser.Physics.Arcade.Image
      if (this.level.gaps.some(([start, end]) => platform.x > start && platform.x < end)) {
        platform.disableBody(true, true)
      }
      return true
    })

    this.level.ledges.forEach(([x, y, width]) => {
      for (let i = 0; i < width; i += 1) {
        const platform = this.platforms.create(x + i * 92, y, 'platform') as Phaser.Physics.Arcade.Image
        platform.setTint(this.level.platformTint)
        platform.refreshBody()
      }
    })

    const biscuitPositions: Array<[number, number]> = []
    for (let x = 320; x < WORLD_WIDTH - 280; x += 470) {
      if (!this.level.gaps.some(([start, end]) => x > start - 40 && x < end + 40)) {
        biscuitPositions.push([x, 420])
      }
    }
    this.level.ledges.forEach(([x, y, width]) => {
      for (let i = 0; i < width; i += 1) {
        biscuitPositions.push([x + i * 92, y - 50])
      }
    })
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
    ;[4, 12, this.level.ledges.length - 2].map((index) => this.level.ledges[index]).forEach(([x, y, width]) => {
      const hotdogX = x + (width - 1) * 46
      const hotdog = this.hotdogs.create(x, y, 'hotdog') as Phaser.Physics.Arcade.Image
      hotdog.setPosition(hotdogX, y - 75)
      this.tweens.add({ targets: hotdog, scale: 1.12, duration: 500, yoyo: true, repeat: -1 })
    })

    this.enemies = this.physics.add.group()
    this.level.enemies.forEach((enemy) => this.addEnemy(...enemy))

    const goalTexture = this.level.theme === 'meadow' ? 'doghouse' : 'exit-door'
    this.add.image(WORLD_WIDTH - 170, 448, goalTexture).setOrigin(0.5, 1)
    this.add
      .text(WORLD_WIDTH - 170, 315, this.level.goalLabel, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#fff4d6',
        backgroundColor: '#70412f',
        padding: { x: 8, y: 5 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    if (this.level.theme === 'meadow') {
      for (let x = 180; x < WORLD_WIDTH; x += 430) {
        this.add.image(x, 454, 'flower').setOrigin(0.5, 1).setFlipX(x % 2 === 0)
      }
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
    enemy.setSize(gravity ? 36 : 30, gravity ? 32 : 22)
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

    this.add
      .text(480, 22, `LEVEL ${gameState.level + 1}/${LEVELS.length} · ${this.level.name.toUpperCase()}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#fff4d6',
        backgroundColor: '#2d201dcc',
        padding: { x: 12, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)

    this.livesGroup = this.add.group()
    this.updateLivesHud()
  }

  private showLevelIntro() {
    const banner = this.add
      .container(480, 245, [
        this.add.rectangle(0, 0, 610, 125, 0x2d201d, 0.9).setStrokeStyle(4, 0xffe7ab),
        this.add
          .text(0, -22, `LEVEL ${gameState.level + 1}: ${this.level.name.toUpperCase()}`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '25px',
            color: '#fff4d6',
            fontStyle: 'bold',
          })
          .setOrigin(0.5),
        this.add
          .text(0, 24, this.level.subtitle, {
            fontFamily: '"Courier New", monospace',
            fontSize: '16px',
            color: '#ffd47c',
            fontStyle: 'bold',
          })
          .setOrigin(0.5),
      ])
      .setScrollFactor(0)
      .setDepth(900)
      .setAlpha(0)
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 250,
      hold: 1300,
      yoyo: true,
      onComplete: () => banner.destroy(),
    })
  }

  private createPauseUi() {
    this.pauseButton = this.add
      .text(940, 65, 'PAUSE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#fff4d6',
        backgroundColor: '#784536',
        padding: { x: 10, y: 7 },
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1001)
      .setInteractive({ useHandCursor: true })
    this.pauseButton.on('pointerdown', () => this.togglePause())

    const backdrop = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x221916, 0.72)
      .setScrollFactor(0)
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 230, 0x2d201d, 0.97)
      .setStrokeStyle(5, 0xffe7ab)
      .setScrollFactor(0)
    const title = this.add
      .text(GAME_WIDTH / 2, 225, 'PAWS-ED!', {
        fontFamily: '"Courier New", monospace',
        fontSize: '42px',
        color: '#fff4d6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
    const instructions = this.add
      .text(GAME_WIDTH / 2, 285, 'PRESS P, ESC, OR TAP RESUME', {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#ffd47c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
    const resume = this.add
      .text(GAME_WIDTH / 2, 345, 'RESUME', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#4a2b25',
        backgroundColor: '#fff4d6',
        padding: { x: 22, y: 10 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
    resume.on('pointerdown', () => this.togglePause())

    this.pauseOverlay = this.add
      .container(0, 0, [backdrop, panel, title, instructions, resume])
      .setDepth(1000)
      .setVisible(false)
  }

  private togglePause() {
    if (this.isComplete) {
      return
    }

    this.isPaused = !this.isPaused
    gameState.paused = this.isPaused
    this.pauseOverlay.setVisible(this.isPaused)
    this.pauseButton.setText(this.isPaused ? 'RESUME' : 'PAUSE')

    if (this.isPaused) {
      this.physics.pause()
      this.tweens.pauseAll()
      this.player.anims.pause()
      controls.left = false
      controls.right = false
      controls.jump = false
      void meadowMusic.pauseForGame()
    } else {
      this.physics.resume()
      this.tweens.resumeAll()
      this.player.anims.resume()
      void meadowMusic.resumeFromGamePause()
    }
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
      void meadowMusic.playGameOverTune()
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
    this.physics.pause()
    this.cameras.main.flash(500, 255, 244, 214)
    this.time.delayedCall(500, () => this.showEndCard(true))
  }

  private showEndCard(won: boolean) {
    const camera = this.cameras.main
    const x = camera.scrollX + GAME_WIDTH / 2
    const isFinalLevel = gameState.level === LEVELS.length - 1
    const title = won
      ? isFinalLevel
        ? 'FREEDOM! WHAT A GOOD DOG!'
        : `${this.level.name.toUpperCase()} COMPLETE!`
      : 'OH, BISCUITS!'
    const subtitle = won
      ? isFinalLevel
        ? `Choco escaped the vet and finished all ${LEVELS.length} adventures!`
        : `Choco found ${gameState.biscuits} of ${gameState.totalBiscuits} biscuits. Next stop: ${LEVELS[gameState.level + 1].name}!`
      : `${this.level.name} needs another try.`

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
    const actionLabel = won
      ? isFinalLevel
        ? 'PRESS SPACE OR TAP FOR TITLE'
        : 'PRESS SPACE OR TAP FOR NEXT LEVEL'
      : 'PRESS SPACE OR TAP TO RETRY LEVEL'
    const retry = this.add
      .text(x, 350, actionLabel, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#4a2b25',
        backgroundColor: '#fff4d6',
        padding: { x: 14, y: 10 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const continueGame = () => {
      if (won && isFinalLevel) {
        gameState.level = 0
        gameState.lives = 3
        this.scene.start('TitleScene')
      } else {
        if (won) {
          gameState.level += 1
        } else {
          gameState.lives = 3
        }
        this.scene.restart()
      }
    }
    retry.on('pointerdown', continueGame)
    this.input.keyboard?.once('keydown-SPACE', continueGame)
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
      <span><kbd>P</kbd> or <kbd>Esc</kbd> to pause / resume</span>
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
