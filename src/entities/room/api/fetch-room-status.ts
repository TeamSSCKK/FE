
import type { RoomStatus, Member, Location } from "../model/types";

// TODO: apiClient 교체
// Mock in-memory store for members per room
const mockMemberStore = new Map<string, Member[]>();

export async function fetchRoomStatus(code: string): Promise<RoomStatus> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 400));

  // Load room data from localStorage
  const storedRoomData = localStorage.getItem(`room-${code}`);
  if (!storedRoomData) {
    throw new Error("Room not found");
  }
  const roomData = JSON.parse(storedRoomData);

  // Initialize members if not exists
  if (!mockMemberStore.has(code)) {
    const hostMember: Member = {
      id: "host-" + Date.now(),
      name: roomData.hostName,
      isHost: true,
      hasLocation: true,
      hasPreference: true,
      hasVoted: false,
      locationLabel: undefined,
    };
    mockMemberStore.set(code, [hostMember]);
  }

  const members = mockMemberStore.get(code)!;
  const locationInputCount = members.filter((m) => m.hasLocation).length;
  const preferenceInputCount = members.filter((m) => m.hasPreference).length;
  const totalCount = members.length;

  return {
    room: {
      code: roomData.code,
      name: roomData.name,
      dateTime: roomData.dateTime,
      hostName: roomData.hostName,
      createdAt: roomData.createdAt,
    },
    members,
    totalCount,
    locationInputCount,
    preferenceInputCount,
    // ✅ currentMember 속성 제거 완료 (types.ts 변경사항 반영)
  };
}

export async function joinRoom(params: {
  code: string;
  name: string;
  password: string;
}): Promise<{ memberId: string; member: Member }> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 500));

  // 방 존재 여부만 확인합니다.
  const storedRoomData = localStorage.getItem(`room-${params.code}`);
  if (!storedRoomData) {
    throw new Error("Room not found");
  }

  // ❌ [삭제된 부분] 방 공통 비밀번호와 비교하는 로직을 삭제했습니다.
  // const roomData = JSON.parse(storedRoomData);
  // if (roomData.password !== params.password) {
  //   throw new Error("Invalid password");
  // }

  // ✅ 새 멤버 생성 (입력받은 params.password는 향후 백엔드 연동 시 암호화하여 DB에 저장)
  const newMember: Member = {
    id: "m-" + Date.now(),
    name: params.name,
    isHost: false,
    hasLocation: false,
    hasPreference: false,
    hasVoted: false,
    locationLabel: undefined,
  };

  // Add to store
  if (!mockMemberStore.has(params.code)) {
    mockMemberStore.set(params.code, []);
  }
  mockMemberStore.get(params.code)!.push(newMember);

  return {
    memberId: newMember.id,
    member: newMember,
  };
}

export async function deleteMember(params: {
  code: string;
  memberId: string;
}): Promise<void> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 300));

  const members = mockMemberStore.get(params.code);
  if (members) {
    const index = members.findIndex((m) => m.id === params.memberId);
    if (index !== -1) {
      members.splice(index, 1);
    }
  }
}

export async function updateMemberLocation(params: {
  code: string;
  memberId: string;
  location: Location;
}): Promise<Member> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 350));

  const members = mockMemberStore.get(params.code);
  if (!members) throw new Error("Room not found");
  const target = members.find((m) => m.id === params.memberId);
  if (!target) throw new Error("Member not found");

  target.location = params.location;
  target.locationLabel = params.location.label;
  target.hasLocation = true;

  return target;
}