import { TARGET_LABEL, VARIANT_LABEL, petLabel, slotPoint, type Focus, type Plan, type PlannerPet, type Variant } from "./planner-core";

export type PlanImageExportResult = "saved" | "downloaded" | "cancelled" | "empty" | "failed";

type PlanImageExportOptions = {
  plan: Plan;
  planIndex: number;
  focus: Focus;
  petImageBase: string;
  traitImageBase: string;
};

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    id: string;
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
  ROCO_PLAN_IMAGE_ASSETS?: Readonly<Record<string, string>>;
};

const WIDTH = 1600;
const HEIGHT = 1000;
const FONT_STACK = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function fillRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string) {
  roundedRect(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
}

function strokeRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, stroke: string, lineWidth = 1) {
  roundedRect(context, x, y, width, height, radius);
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.stroke();
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let value = text;
  while (value.length > 1 && context.measureText(`${value}…`).width > maxWidth) value = value.slice(0, -1);
  return `${value}…`;
}

function drawContainedImage(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    const normalizedSource = source.replace(/^(?:\.\/|\/)/, "");
    const embeddedAssets = (window as SaveFilePickerWindow).ROCO_PLAN_IMAGE_ASSETS;
    image.src = embeddedAssets?.[source] ?? embeddedAssets?.[normalizedSource] ?? source;
  });
}

function assetPath(base: string, fileName: string) {
  return `${base.endsWith("/") ? base : `${base}/`}${fileName}`;
}

function petImagePath(pet: PlannerPet, base: string) {
  return assetPath(base, pet.image || `${pet.id}.webp`);
}

function traitImagePath(variant: Variant, base: string) {
  return assetPath(base, `mark-${variant}.png`);
}

function drawGrid(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  context.save();
  context.strokeStyle = "rgba(57, 43, 135, 0.075)";
  context.lineWidth = 1;
  for (let gridX = x; gridX <= x + width; gridX += 44) {
    context.beginPath();
    context.moveTo(gridX, y);
    context.lineTo(gridX, y + height);
    context.stroke();
  }
  for (let gridY = y; gridY <= y + height; gridY += 44) {
    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x + width, gridY);
    context.stroke();
  }
  context.restore();
}

function drawFallbackPet(context: CanvasRenderingContext2D, pet: PlannerPet, centerX: number, centerY: number) {
  context.fillStyle = "#625b70";
  context.font = `800 26px ${FONT_STACK}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(pet.name.slice(0, 1), centerX, centerY);
}

function drawPlanNode(
  context: CanvasRenderingContext2D,
  slot: Plan["slots"][number],
  centerX: number,
  centerY: number,
  petImage: HTMLImageElement | null,
  traitImage: HTMLImageElement | null,
) {
  context.save();
  const shellX = centerX - 43;
  const shellY = centerY - 42;
  context.save();
  context.shadowColor = "rgba(47, 35, 89, 0.14)";
  context.shadowBlur = 20;
  context.shadowOffsetY = 8;
  fillRoundedRect(context, shellX, shellY, 86, 80, 25, slot.role === "father" ? "#ddd8f2" : "#f1dce1");
  context.restore();
  strokeRoundedRect(context, shellX, shellY, 86, 80, 25, "#fffefa", 4);

  if (petImage) drawContainedImage(context, petImage, centerX - 34, centerY - 36, 68, 68);
  else drawFallbackPet(context, slot.pet, centerX, centerY - 2);

  const pinX = centerX + 29;
  const pinY = centerY - 51;
  fillRoundedRect(context, pinX, pinY, 31, 31, 10, slot.role === "father" ? "#4d7fe6" : "#ef6478");
  strokeRoundedRect(context, pinX, pinY, 31, 31, 10, "#fffefa", 3);
  context.fillStyle = "#fffefa";
  context.font = `800 17px ${FONT_STACK}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(slot.role === "father" ? "♂" : "♀", pinX + 15.5, pinY + 15.5);

  if (slot.variant !== "normal" && traitImage) {
    context.save();
    context.shadowColor = "rgba(41, 82, 110, 0.2)";
    context.shadowBlur = 4;
    drawContainedImage(context, traitImage, centerX + 24, centerY + 20, 34, 34);
    context.restore();
  }

  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#211d33";
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText(fitText(context, petLabel(slot.pet), 210), centerX, centerY + 65);
  context.fillStyle = "#716a7d";
  context.font = `600 14px ${FONT_STACK}`;
  context.fillText(`${VARIANT_LABEL[slot.variant]}${slot.role === "father" ? "父本" : "母本"}`, centerX, centerY + 89);
  context.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.94));
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function renderPlanImage(options: PlanImageExportOptions) {
  const { plan, planIndex, focus, petImageBase, traitImageBase } = options;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const imageSources = new Set<string>();
  plan.slots.forEach((slot) => {
    imageSources.add(petImagePath(slot.pet, petImageBase));
    if (slot.variant !== "normal") imageSources.add(traitImagePath(slot.variant, traitImageBase));
  });
  const imageEntries = await Promise.all(Array.from(imageSources, async (source) => [source, await loadImage(source)] as const));
  const images = new Map(imageEntries);

  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "#6752d9";
  context.font = `800 17px ${FONT_STACK}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText("ROCO NEST PLAN", 72, 54);
  context.fillStyle = "#211d33";
  context.font = `900 42px ${FONT_STACK}`;
  context.fillText(`推荐摆窝方案 ${planIndex + 1}`, 72, 108);
  context.fillStyle = "#716a7d";
  context.font = `600 18px ${FONT_STACK}`;
  const focusLabel = focus === "all" ? "全部赛季" : focus;
  context.fillText(`${focusLabel} · ${plan.slots.length} 个窝位 · ${TARGET_LABEL[plan.kind]}目标`, 74, 140);

  fillRoundedRect(context, 1320, 44, 208, 92, 20, "#fff7df");
  strokeRoundedRect(context, 1320, 44, 208, 92, 20, "#e8ce8f", 2);
  context.fillStyle = "#786e5a";
  context.font = `700 15px ${FONT_STACK}`;
  context.fillText("推荐度", 1344, 80);
  context.fillStyle = "#986400";
  context.font = `900 34px ${FONT_STACK}`;
  context.fillText(plan.recommendation ? `${plan.recommendation}%` : "--", 1430, 83);
  context.fillStyle = "#8b7a5b";
  context.font = `700 14px ${FONT_STACK}`;
  context.fillText(plan.targetTier === "season-limited" ? "限时异色优先" : plan.targetTier === "permanent" ? "常驻异色补全" : `${TARGET_LABEL[plan.kind]}方案`, 1344, 113);

  const mapX = 48;
  const mapY = 172;
  const mapWidth = 1504;
  const mapHeight = 672;
  context.fillStyle = "#f4f0e7";
  context.fillRect(mapX, mapY, mapWidth, mapHeight);
  drawGrid(context, mapX, mapY, mapWidth, mapHeight);

  context.save();
  context.strokeStyle = "rgba(132, 121, 106, 0.42)";
  context.lineWidth = 2;
  context.setLineDash([8, 11]);
  context.lineCap = "round";
  plan.edges.forEach((edge) => {
    const start = slotPoint(edge.father);
    const end = slotPoint(edge.mother);
    context.beginPath();
    context.moveTo(mapX + (start.left / 100) * mapWidth, mapY + (start.top / 100) * mapHeight);
    context.lineTo(mapX + (end.left / 100) * mapWidth, mapY + (end.top / 100) * mapHeight);
    context.stroke();
  });
  context.restore();

  plan.slots.forEach((slot) => {
    const point = slotPoint(slot);
    const centerX = mapX + (point.left / 100) * mapWidth;
    const centerY = mapY + (point.top / 100) * mapHeight;
    drawPlanNode(
      context,
      slot,
      centerX,
      centerY,
      images.get(petImagePath(slot.pet, petImageBase)) || null,
      slot.variant === "normal" ? null : images.get(traitImagePath(slot.variant, traitImageBase)) || null,
    );
  });

  const targetCounts = new Map<string, number>();
  plan.slots.filter((slot) => slot.role === "mother").forEach((slot) => {
    const label = petLabel(slot.pet);
    targetCounts.set(label, (targetCounts.get(label) || 0) + 1);
  });
  const targetNames = [...targetCounts].map(([label, count]) => count > 1 ? `${label} ×${count}` : label);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#211d33";
  context.font = `800 17px ${FONT_STACK}`;
  context.fillText("本轮孵蛋目标", 72, 895);
  context.fillStyle = "#716a7d";
  context.font = `600 16px ${FONT_STACK}`;
  context.fillText(fitText(context, targetNames.join("  ·  ") || "暂无可用目标", 1190), 220, 895);

  context.strokeStyle = "#ddd6ca";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(72, 930);
  context.lineTo(1528, 930);
  context.stroke();
  context.fillStyle = "#8b8495";
  context.font = `600 14px ${FONT_STACK}`;
  context.fillText("浅色虚线表示同蛋组且窝位横、竖或斜向相邻", 72, 954);
  context.textAlign = "right";
  context.fillText("珍稀孵蛋规划台 · 洛克王国世界", 1528, 954);

  return canvasToBlob(canvas);
}

export async function exportPlanImage(options: PlanImageExportOptions): Promise<PlanImageExportResult> {
  if (!options.plan.slots.length) return "empty";
  const focusSlug = options.focus === "all" ? "all" : options.focus.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const fileName = `roco-nest-plan-${focusSlug || "season"}-${options.planIndex + 1}.png`;
  const savePicker = (window as SaveFilePickerWindow).showSaveFilePicker;
  let blob: Blob | null = null;

  try {
    blob = await renderPlanImage(options);
  } catch (error) {
    console.error("Failed to render the nest plan image.", error);
  }
  if (!blob) return "failed";

  if (savePicker) {
    try {
      const fileHandle = await savePicker.call(window, {
        id: "roco-plan-image-export",
        suggestedName: fileName,
        types: [{ description: "PNG 摆窝方案图片", accept: { "image/png": [".png"] } }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(await blob.arrayBuffer());
      await writable.close();
      return "saved";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      console.error("Failed to save the nest plan image with the file picker; falling back to a browser download.", error);
    }
  }

  try {
    downloadBlob(blob, fileName);
    return "downloaded";
  } catch (error) {
    console.error("Failed to download the nest plan image.", error);
    return "failed";
  }
}
