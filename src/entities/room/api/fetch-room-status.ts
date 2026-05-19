
import type { RoomStatus, Member, Location } from "../model/types";

// TODO: apiClient 교체
// 멤버 목록 mock 저장소.
// 모듈 레벨 Map은 탭/새로고침마다 초기화되어 다른 탭에서 참가한 멤버가
// 주최자 화면에 반영되지 않았다. localStorage에 보관해 같은 브라우저의
// 탭 간 동기화 + 새로고침 유지가 되도록 한다. (기기 간 동기화는 백엔드 필요)
const membersKey = (code: string) => `members-${code}`;

function readMembers(code: string): Member[] | null {
  const raw = localStorage.getItem(membersKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member[];
  } catch {
    return null;
  }
}

function writeMembers(code: string, members: Member[]): void {
  localStorage.setItem(membersKey(code), JSON.stringify(members));
}

export async function fetchRoomStatus(code: string): Promise<RoomStatus> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 400));

  // Load room data from localStorage
  const storedRoomData = localStorage.getItem(`room-${code}`);
  if (!storedRoomData) {
    throw new Error("Room not found");
  }
  const roomData = JSON.parse(storedRoomData);

  // 멤버 목록이 없으면 주최자만 담아 초기화한다.
  let members = readMembers(code);
  if (!members) {
    const hostMember: Member = {
      id: "host-" + Date.now(),
      name: roomData.hostName,
      isHost: true,
      hasLocation: true,
      hasPreference: true,
      hasVoted: false,
      locationLabel: undefined,
    };
    members = [hostMember];
    writeMembers(code, members);
  }

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

  const members = readMembers(params.code) ?? [];
  members.push(newMember);
  writeMembers(params.code, members);

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

  const members = readMembers(params.code);
  if (members) {
    const index = members.findIndex((m) => m.id === params.memberId);
    if (index !== -1) {
      members.splice(index, 1);
      writeMembers(params.code, members);
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

  const members = readMembers(params.code);
  if (!members) throw new Error("Room not found");
  const target = members.find((m) => m.id === params.memberId);
  if (!target) throw new Error("Member not found");

  target.location = params.location;
  target.locationLabel = params.location.label;
  target.hasLocation = true;
  writeMembers(params.code, members);

  return target;
}
