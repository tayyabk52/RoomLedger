"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Group = { id: number; name: string; password: string; currency: string };
type Member = { id: number; group_id: number; username: string; is_admin: boolean };

type SplitParticipant = { memberId: number; contributed: number; included: boolean };

export default function Home() {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<"auth" | "dashboard" | "add" | "settle" | "history" | "manage">("auth");

  // Auth state
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState<string>("");

  // Add expense state
  const [description, setDescription] = useState("");
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);
  const [adding, setAdding] = useState(false);
  const currency = currentGroup?.currency ?? "PKR";

  useEffect(() => {
    if (members.length) {
      setParticipants(
        members.map((m) => ({ memberId: m.id, contributed: 0, included: true }))
      );
    }
  }, [members]);

  const evenShare = useMemo(() => {
    const included = participants.filter((p) => p.included);
    return included.length ? amountTotal / included.length : 0;
  }, [participants, amountTotal]);

  async function handleCreateGroup() {
    setAuthError("");
    if (!roomName || !roomPass || !username) {
      setAuthError("Please fill all fields");
      return;
    }
    const { data: group, error: gErr } = await supabase
      .from("groups")
      .insert({ name: roomName, password: roomPass, currency: "PKR" })
      .select()
      .single();
    if (gErr) return setAuthError(gErr.message);
    const { data: member, error: mErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, username, is_admin: true })
      .select()
      .single();
    if (mErr) return setAuthError(mErr.message);
    setCurrentGroup(group);
    setCurrentUser(member);
    const { data: ms } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id);
    setMembers(ms || []);
    setView("dashboard");
  }

  async function handleLogin() {
    setAuthError("");
    if (!roomName || !roomPass || !username) {
      setAuthError("Please fill all fields");
      return;
    }
    const { data: group, error: gErr } = await supabase
      .from("groups")
      .select("*")
      .eq("name", roomName)
      .single();
    if (gErr || !group) return setAuthError("Room not found");
    if (group.password !== roomPass) return setAuthError("Wrong password");
    const { data: member, error: mErr } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id)
      .eq("username", username)
      .single();
    if (mErr || !member) return setAuthError("User not found in this room");
    setCurrentGroup(group);
    setCurrentUser(member);
    const { data: ms } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id);
    setMembers(ms || []);
    setView("dashboard");
  }

  // Add expense with flexible contributions
  async function addExpense() {
    if (!currentGroup || !currentUser) return;
    if (!description || amountTotal <= 0) return;
    setAdding(true);
    try {
      // Calculate net owed per member: even share minus what they contributed
      const included = participants.filter((p) => p.included);
      const share = included.length ? amountTotal / included.length : 0;

      // For each participant, if contributed < share => they owe; if > share => they are owed
      // We record pairwise transactions: from debtor to creditor, greedy settlement
      const creditors: { id: number; amount: number }[] = [];
      const debtors: { id: number; amount: number }[] = [];
      included.forEach((p) => {
        const diff = p.contributed - share;
        if (diff > 0.01) creditors.push({ id: p.memberId, amount: diff });
        else if (diff < -0.01) debtors.push({ id: p.memberId, amount: -diff });
      });

      const txns: any[] = [];
      let i = 0,
        j = 0;
      while (i < creditors.length && j < debtors.length) {
        const give = creditors[i];
        const take = debtors[j];
        const a = Math.min(give.amount, take.amount);
        txns.push({
          group_id: currentGroup.id,
          description,
          from_member_id: take.id,
          to_member_id: give.id,
          amount: a,
          created_by: currentUser.id,
        });
        give.amount -= a;
        take.amount -= a;
        if (give.amount < 0.01) i++;
        if (take.amount < 0.01) j++;
      }
      if (txns.length) {
        const { error } = await supabase.from("transactions").insert(txns);
        if (error) throw error;
      }
      setDescription("");
      setAmountTotal(0);
      setParticipants((prev) => prev.map((p) => ({ ...p, contributed: 0 })));
      setView("dashboard");
    } finally {
      setAdding(false);
    }
  }

  function Dashboard() {
    const [total, setTotal] = useState(0);
    const [recent, setRecent] = useState<any[]>([]);
    const [balances, setBalances] = useState<{ name: string; amount: number }[]>([]);

    useEffect(() => {
      if (!currentGroup) return;
      (async () => {
        const { data: tx } = await supabase
          .from("transactions")
          .select("amount, from_member_id, to_member_id")
          .eq("group_id", currentGroup.id)
          .order("created_at", { ascending: false })
          .limit(10);
        const totalAmount = (tx || []).reduce((s, t) => s + Number(t.amount || 0), 0);
        setTotal(totalAmount);
        setRecent(tx || []);
        // balances
        const map = new Map<number, number>();
        members.forEach((m) => map.set(m.id, 0));
        (tx || []).forEach((t) => {
          map.set(t.from_member_id, (map.get(t.from_member_id) || 0) - Number(t.amount));
          map.set(t.to_member_id, (map.get(t.to_member_id) || 0) + Number(t.amount));
        });
        setBalances(
          members
            .map((m) => ({ name: m.username, amount: map.get(m.id) || 0 }))
            .filter((b) => Math.abs(b.amount) > 0.01)
        );
      })();
    }, [currentGroup, members]);

    return (
      <div className="vstack" style={{ gap: 16 }}>
        <div className="card vstack">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="muted">Welcome</div>
              <div style={{ fontWeight: 700 }}>{currentUser?.username}</div>
            </div>
            <div className="tag">{currentGroup?.name}</div>
          </div>
          <div className="row section">
            <div className="col card vstack">
              <div className="muted">Total recorded</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{currency} {total.toFixed(2)}</div>
            </div>
            <div className="col card vstack">
              <div className="muted">Members</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{members.length}</div>
            </div>
          </div>
        </div>

        <div className="card vstack">
          <div className="hstack" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700 }}>Current balances</div>
            <button className="btn" onClick={() => setView('settle')}>Settle up</button>
          </div>
          {balances.length === 0 ? (
            <div className="muted">Everyone is square.</div>
          ) : (
            <div className="vstack">
              {balances.map((b, i) => (
                <div key={i} className="hstack" style={{ justifyContent: 'space-between' }}>
                  <div>{b.name}</div>
                  <div style={{ color: b.amount >= 0 ? 'var(--primary)' : 'var(--danger)', fontWeight: 700 }}>
                    {b.amount >= 0 ? '+' : ''}{currency} {Math.abs(b.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card vstack">
          <div style={{ fontWeight: 700 }}>Recent</div>
          <div className="vstack">
            {(recent || []).map((t, i) => (
              <div key={i} className="hstack" style={{ justifyContent: 'space-between' }}>
                <div className="muted">Txn</div>
                <div>{currency} {Number(t.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function AddExpense() {
    return (
      <div className="vstack" style={{ gap: 16 }}>
        <div className="card vstack">
          <div style={{ fontWeight: 700 }}>New expense</div>
          <input className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="input" type="number" placeholder="Total amount" value={amountTotal} onChange={(e) => setAmountTotal(parseFloat(e.target.value || '0'))} />
        </div>
        <div className="card vstack">
          <div className="hstack" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700 }}>Participants</div>
            <div className="muted">Even share: {currency} {evenShare.toFixed(2)}</div>
          </div>
          <div className="vstack">
            {members.map((m) => {
              const p = participants.find((x) => x.memberId === m.id)!;
              return (
                <div key={m.id} className="hstack" style={{ gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="hstack" style={{ gap: 8 }}>
                    <input type="checkbox" checked={p?.included ?? false} onChange={(e) => setParticipants((prev) => prev.map((x) => x.memberId === m.id ? { ...x, included: e.target.checked } : x))} />
                    {m.username}
                  </label>
                  <input className="input" style={{ maxWidth: 140 }} type="number" step="0.01" value={p?.contributed ?? 0} onChange={(e) => setParticipants((prev) => prev.map((x) => x.memberId === m.id ? { ...x, contributed: parseFloat(e.target.value || '0') } : x))} />
                </div>
              );
            })}
          </div>
          <button className="btn primary" onClick={addExpense} disabled={adding}>Add</button>
        </div>
      </div>
    );
  }

  if (view === "auth") {
    return (
      <div className="container vstack" style={{ gap: 16 }}>
        <div className="vstack" style={{ gap: 6 }}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>RoomLedger</div>
          <div className="muted">Smart expense sharing for roommates</div>
        </div>

        <div className="card vstack">
          <div style={{ fontWeight: 700 }}>Join your room</div>
          <input className="input" placeholder="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <input className="input" placeholder="Room password" type="password" value={roomPass} onChange={(e) => setRoomPass(e.target.value)} />
          <input className="input" placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          {authError && <div style={{ color: 'var(--danger)' }}>{authError}</div>}
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn primary" onClick={handleLogin}>Login</button>
            <button className="btn" onClick={handleCreateGroup}>Create room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container vstack" style={{ gap: 16 }}>
      <div className="hstack" style={{ justifyContent: 'space-between' }}>
        <div className="hstack" style={{ gap: 8 }}>
          <button className="btn" onClick={() => setView('dashboard')}>Dashboard</button>
          <button className="btn" onClick={() => setView('add')}>Add expense</button>
        </div>
        <div className="hstack" style={{ gap: 8 }}>
          <div className="tag">{currentGroup?.name}</div>
          <div className="muted">{currentUser?.username}</div>
        </div>
      </div>

      {view === 'dashboard' && <Dashboard />}
      {view === 'add' && <AddExpense />}
    </div>
  );
}

