// ---------- Dimensions (1 unit = 1 meter) ----------
export const W = 3.4, D = 6.5, H = 2.8;
export const WALL = 0.1;
export const ROOM_FRONT_Z = -D / 2;
export const FAR_Z = ROOM_FRONT_Z + WALL / 2;

// ---------- Side openings ----------
export const FRAME_T = 0.08;
export const WIN_W = 1.0, WIN_Y0 = 0.8, WIN_Y1 = 2.2;
export const WIN_FAR_GAP = 0.15;
export const WIN_Z = FAR_Z + WIN_FAR_GAP + FRAME_T + WIN_W / 2;
export const DOOR_W = 1.0, DOOR_H = 2.1;
export const DOOR_GAP = 0.25;
export const DOOR_Z = WIN_Z + WIN_W / 2 + FRAME_T + DOOR_GAP + FRAME_T + DOOR_W / 2;
export const BTN_Z = DOOR_Z + DOOR_W / 2 + 0.18;
export const CAM_BTN_DIST = 0.64;
export const ROOM_BACK_Z = BTN_Z + CAM_BTN_DIST + 0.8;
export const ROOM_DEPTH = ROOM_BACK_Z - ROOM_FRONT_Z;
export const ROOM_MID_Z = (ROOM_FRONT_Z + ROOM_BACK_Z) / 2;
export const HALL_BACK_Z = BTN_Z + CAM_BTN_DIST + 0.15;

// Desk
export const DESK_W = 2.8, DESK_D = 0.9, DESK_TOP = 0.8, DESK_T = 0.08;
export const DESK_Z = FAR_Z + DESK_D / 2 + 0.02;
export const DESK_SURFACE = DESK_TOP + DESK_T / 2;
export const DESK_SCALE = 1.0;
export const OFFICE_LIGHT_COLOR = 0xffa24a;
export const HALL_LIGHT_COLOR = 0xd5ddff;
export const WALLPAPER_TILE_WIDTH = 1.4;
export const WALLPAPER_TILE_HEIGHT = H;

export const HALL_W = 1.8;
export const HALL_B = 3.0;
export const TILE = 0.2;
export const TOTAL_W = W + HALL_W * 2;
export const Z_MIN = ROOM_FRONT_Z - HALL_B;
export const Z_MAX = HALL_BACK_Z;
export const Z_LEN = Z_MAX - Z_MIN;
export const Z_MID = (Z_MAX + Z_MIN) / 2;
