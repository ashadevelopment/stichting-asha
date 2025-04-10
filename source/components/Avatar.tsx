interface AvatarProps {
    src?: string | null;
    initial?: string;
    size?: number;
}
  
export default function Avatar({ src, initial = 'U', size = 88 }: AvatarProps) {
    return src ? (
        <img
        src={src}
        alt="Profielfoto"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        />
    ) : (
        <div
        className="rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold uppercase"
        style={{ width: size, height: size, fontSize: size / 2 }}
        >
        {initial}
        </div>
    )
}
