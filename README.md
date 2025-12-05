# Waypoint Editor Web

ROS2 Navigation用のウェイポイント編集ツール（Webアプリケーション版）

## 概要

ブラウザ上でPGM/YAMLマップファイルを読み込み、ウェイポイントを視覚的に配置・編集してCSVファイルとして出力するツールです。

## 機能

- **マップ読み込み**: PGM/PNG/JPEG + YAML形式のマップファイルに対応
- **編集モード**:
  - **Point**: クリックでウェイポイントを追加
  - **Line**: ドラッグで経路を描画し、一定間隔でウェイポイントを自動生成
  - **Pan**: マップをドラッグで移動
- **ウェイポイント設定**:
  - 座標（x, y）
  - 向き（yaw）
  - 一時停止時間（pause_sec）
- **CSV入出力**: ウェイポイントのインポート/エクスポート
- **ズーム・パン**: マウスホイールとドラッグでマップを自由に操作

## 使い方

### ローカルで実行

1. `index.html`をブラウザで開く
2. PGMファイルとYAMLファイルを読み込む
3. ウェイポイントを配置
4. CSVファイルとしてエクスポート

### Cloudflare Pagesへのデプロイ

#### 方法1: GitHub連携（推奨）

1. GitHubに新しいリポジトリを作成
2. このディレクトリをプッシュ:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/waypoint-editor-web.git
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. [Cloudflare Dashboard](https://dash.cloudflare.com/)にログイン
4. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
5. GitHubリポジトリを選択
6. ビルド設定:
   - **Build command**: （空欄）
   - **Build output directory**: `.`
7. **Save and Deploy**をクリック

#### 方法2: Wrangler CLI使用（pnpm）

```bash
# 依存関係をインストール
pnpm install

# Cloudflareにログイン（初回のみ）
pnpm wrangler login

# デプロイ
pnpm run deploy

# または、プロジェクト名を指定してデプロイ
pnpm wrangler pages deploy . --project-name=waypoint-editor
```

### カスタムドメインの設定（k1h.dev）

1. Cloudflare Pagesプロジェクトページを開く
2. **Custom domains** > **Set up a custom domain**
3. `k1h.dev`または`waypoint.k1h.dev`を入力
4. DNSレコードを追加（Cloudflareが管理している場合は自動）

## CSVフォーマット

```csv
x,y,yaw,pause_sec
-50.1234,10.5678,1.5708,0
-48.0000,12.0000,1.5708,5
-46.0000,14.0000,1.5708,-1
```

| カラム | 説明 |
|--------|------|
| `x` | X座標（メートル、mapフレーム） |
| `y` | Y座標（メートル、mapフレーム） |
| `yaw` | 向き（ラジアン） |
| `pause_sec` | 停止時間（0=なし, >0=秒数, -1=トピック待ち） |

## ROS2との連携

このツールで作成したCSVファイルは、ROS2のwaypoint_followerパッケージで読み込めます:

```bash
ros2 run waypoint_follower_pkg waypoint_follower --ros-args -p csv_file:=/path/to/waypoints.csv
```

## 開発

### ファイル構成

```
waypoint-editor-web/
├── index.html          # メインアプリケーション
├── wrangler.toml       # Cloudflare Pages設定
├── .gitignore          # Git除外設定
└── README.md           # このファイル
```

### ローカル開発サーバー

シンプルなHTTPサーバーで実行:

```bash
# pnpm（推奨）
pnpm install
pnpm dev

# Python
python3 -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

http://localhost:3000 (pnpm) または http://localhost:8000 でアクセス

## ライセンス

このプロジェクトはUgokuita NEOプロジェクトの一部です。

## 関連リンク

- [Ugokuita NEO Main Repository](https://github.com/ugokuita-project/Ugokuita_NEO_ws)
- [ROS2 Navigation2](https://navigation.ros.org/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
