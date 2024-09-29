"use client";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
export default function Home() {

    // Create styles
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4',
            width: '100vh', // Largeur complète
            height: '100vh' // Hauteur complète
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1,
        }
    });

    // Create Document Component
    const MyDocument = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>Section #1</Text>
                </View>
                <View style={styles.section}>
                    <Text>Section #2</Text>
                </View>
            </Page>
        </Document>
    );
    return (

        <MyDocument />

    );
}
