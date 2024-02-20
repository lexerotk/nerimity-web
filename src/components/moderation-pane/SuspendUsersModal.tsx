import { RawUser } from "@/chat-api/RawData";
import { ModerationSuspension, suspendUsers } from "@/chat-api/services/ModerationService";
import { createEffect, createSignal, Show } from "solid-js";
import { css, styled } from "solid-styled-components";
import Button from "../ui/Button";
import { FlexRow } from "../ui/Flexbox";
import Input from "../ui/input/Input";
import Modal from "../ui/modal/Modal";
import Text from "../ui/Text";
import Checkbox from "../ui/Checkbox";


const SuspendUsersContainer = styled("div")`
  min-width: 260px;
  margin-bottom: 10px;
`;

const suspendInputStyle = css`
  width: 90px; 
`;

interface MinimalUser {
  id: string;
  username: string;
  tag: string
}

interface Props {
  users: MinimalUser[];
  close: () => void;
  done: (suspension: ModerationSuspension) => void;
}

export default function SuspendUsersModal(props: Props) {
  const [reason, setReason] = createSignal("");
  const [suspendFor, setSuspendFor] = createSignal("7");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<{message: string, path?: string} | null>(null);
  const [suspending, setSuspending] = createSignal(false);

  const [ipBan, setIpBan] = createSignal(false);

  createEffect(() => {
    let round = Math.round(parseInt(suspendFor()));
    round < 0 && (round = 0);
    setSuspendFor(round.toString());
  });

  const onSuspendClicked = () => {
    if (suspending()) return;
    setSuspending(true);
    setError(null);
    const userIds = props.users.map(u => u.id);
    
    const intSuspendFor = parseInt(suspendFor());

    const preview: ModerationSuspension = {
      expireAt: intSuspendFor ? daysToDate(intSuspendFor) : null,
      suspendedAt: Date.now(),
      reason: reason() || undefined
    };

    suspendUsers(password(), userIds, intSuspendFor, reason() || undefined, ipBan())
      .then(() => {
        props.done(preview); props.close();
      })
      .catch(err => setError(err))
      .finally(() => setSuspending(false));
  };

  const ActionButtons = (
    <FlexRow style={{"justify-content": "flex-end", flex: 1, margin: "5px" }}>
      <Button onClick={onSuspendClicked} margin={0} label={suspending() ? "Suspending..." : "Suspend"} color="var(--alert-color)" primary />
    </FlexRow>
  );



  return (
    <Modal close={props.close} title={`Suspend ${props.users.length} User(s)`} actionButtons={ActionButtons}>
      <SuspendUsersContainer>
        <Input label="Reason" value={reason()} onText={setReason} />
        <FlexRow gap={10}>
          <Input class={suspendInputStyle} label="Suspend for" type="number" value={suspendFor()} onText={setSuspendFor} />
          <Text style={{"margin-top": "45px"}}>Day(s)</Text>
        </FlexRow>
        <Text size={12} opacity={0.7}>0 days will suspend them indefinitely</Text>

        <div style={{"margin-top": "10px", "margin-bottom": "10px"}}>
          <Checkbox  checked={ipBan()} onChange={setIpBan} label="Also IP ban for a week" />
        </div>


        <Input label="Confirm Password" type="password" value={password()} onText={setPassword} />


        <Show when={error()}>
          <Text color="var(--alert-color)" size={12}>{error()?.message}</Text>
        </Show>
      </SuspendUsersContainer>
    </Modal>
  );
}

function daysToDate(days: number) {
  const DAY_IN_MS = 86400000;
  const now = Date.now();
  const expireDate = new Date(now + DAY_IN_MS * days);
  return expireDate.getTime();
}