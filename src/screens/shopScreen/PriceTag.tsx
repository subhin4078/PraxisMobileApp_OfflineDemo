import { ShopSvgAssets } from "@/src/constants/assets/shopAssets";
import { Text, View } from "react-native";

export function PriceTag({ price }: { price: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <ShopSvgAssets.priceTag width={16} height={16} />
      <Text
        className="font-fredokaBold text-primaryText"
        style={{ fontSize: 13 }}
      >
        {price}
      </Text>
    </View>
  );
}
