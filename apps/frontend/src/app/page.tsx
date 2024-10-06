import { Button, Badge, Rating } from "../components/material-tailwind";
export default function Example() {
  return (
    <div>
      <Badge content="5">
        <Button>Notifications</Button>
      </Badge>
      <Rating value={4} placeholder="Rate this" onPointerEnterCapture={3} />
    </div>
  );
}
